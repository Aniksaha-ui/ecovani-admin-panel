import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'

const emptyPagination = { currentPage: 1, from: 0, lastPage: 1, to: 0, total: 0 }

const assertSucceeded = (payload, fallback) => {
  if (payload?.isExecuted === false || payload?.status === false) throw new Error(payload?.message || fallback)
  return payload
}

const normalizePagination = (meta, count) => ({
  currentPage: Number(meta?.current_page) || 1,
  from: Number(meta?.from) || 0,
  lastPage: Number(meta?.last_page) || 1,
  to: Number(meta?.to) || count,
  total: Number(meta?.total) || count,
})

export const getCategories = async ({ page = 1, search = '' } = {}) => {
  const query = new URLSearchParams({ page: String(page), perPage: '10' })
  if (search) query.set('search', search)
  const payload = assertSucceeded(await apiRequest(`${API_URLS.admin.categories}?${query}`), 'Unable to load categories.')
  const meta = payload?.data ?? {}
  const rows = Array.isArray(meta.data) ? meta.data : []
  const pagination = normalizePagination(meta, rows.length)
  return { rows: rows.map((item, index) => ({ ...item, serial: (pagination.from || index + 1) + index })), pagination }
}

export const saveCategory = async (category, id) => {
  const payload = assertSucceeded(await apiRequest(id ? `${API_URLS.admin.categories}/${id}` : API_URLS.admin.categories, {
    method: id ? 'PATCH' : 'POST', body: JSON.stringify(category),
  }), 'Unable to save category.')
  return payload.data
}

export const removeCategory = async (id) => {
  assertSucceeded(await apiRequest(`${API_URLS.admin.categories}/${id}`, { method: 'DELETE' }), 'Unable to delete category.')
}

export { emptyPagination }
