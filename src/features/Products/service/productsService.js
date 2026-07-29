import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'

const emptyPagination = { currentPage: 1, from: 0, lastPage: 1, to: 0, total: 0 }
const assertSucceeded = (payload, fallback) => { if (payload?.isExecuted === false || payload?.status === false) throw new Error(payload?.message || fallback); return payload }
const paginationFor = (meta, count) => ({ currentPage: Number(meta?.current_page) || 1, from: Number(meta?.from) || 0, lastPage: Number(meta?.last_page) || 1, to: Number(meta?.to) || count, total: Number(meta?.total) || count })

export const getProducts = async ({ page = 1, search = '' } = {}) => {
  const query = new URLSearchParams({ page: String(page), perPage: '10' }); if (search) query.set('search', search)
  const payload = assertSucceeded(await apiRequest(`${API_URLS.admin.products}?${query}`), 'Unable to load products.')
  const meta = payload?.data ?? {}; const rows = Array.isArray(meta.data) ? meta.data : []; const pagination = paginationFor(meta, rows.length)
  return { rows: rows.map((item, index) => ({ ...item, serial: (pagination.from || index + 1) + index })), pagination }
}
export const getProductOptions = async () => (assertSucceeded(await apiRequest(API_URLS.admin.productOptions), 'Unable to load product options.').data || {})
export const getProduct = async (id) => assertSucceeded(await apiRequest(`${API_URLS.admin.products}/${id}`), 'Unable to load product.').data
export const saveProduct = async (values, id) => {
  const body = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (key === 'images') Array.from(value || []).forEach((file) => body.append('images[]', file))
    else if (key === 'section_ids') (value || []).forEach((sectionId) => body.append('section_ids[]', String(sectionId)))
    else if (key === 'is_active') body.append(key, value ? '1' : '0')
    else if (value !== undefined && value !== null && value !== '') body.append(key, String(value))
  })
  if (id) { body.append('_method', 'PATCH') }
  return assertSucceeded(await apiRequest(id ? `${API_URLS.admin.products}/${id}` : API_URLS.admin.products, { method: 'POST', body }), 'Unable to save product.').data
}
export const removeProduct = async (id) => { assertSucceeded(await apiRequest(`${API_URLS.admin.products}/${id}`, { method: 'DELETE' }), 'Unable to delete product.') }
export { emptyPagination }
