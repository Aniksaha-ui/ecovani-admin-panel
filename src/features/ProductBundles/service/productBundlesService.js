import { apiRequest } from '../../../services/apiClient'

const check = (payload, fallback) => { if (payload?.isExecuted === false || payload?.status === false) throw new Error(payload?.message || fallback); return payload?.data }
const request = async (path, options) => check(await apiRequest(path, options), 'Product bundle request failed.')

export const listProductBundles = async ({ page = 1, search = '' } = {}) => {
  const query = new URLSearchParams({ page: String(page), perPage: '10' }); if (search) query.set('search', search)
  const data = await request(`/admin/product-bundles?${query}`); const rows = data?.data || []
  return { rows, pagination: { currentPage: data?.current_page || 1, from: data?.from || 0, lastPage: data?.last_page || 1, to: data?.to || rows.length, total: data?.total || rows.length } }
}
export const saveProductBundle = (values, id) => request(id ? `/admin/product-bundles/${id}` : '/admin/product-bundles', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(values) })
export const deleteProductBundle = (id) => request(`/admin/product-bundles/${id}`, { method: 'DELETE' })
export const getProductBundle = (id) => request(`/admin/product-bundles/${id}`)
