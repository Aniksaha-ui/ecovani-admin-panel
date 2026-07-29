import { apiRequest } from '../../../services/apiClient'
const check = (payload, fallback) => { if (payload?.isExecuted === false) throw new Error(payload?.message || fallback); return payload?.data }
const request = async (path, options) => check(await apiRequest(path, options), 'Section request failed.')
export const listSections = async ({ page = 1, search = '' } = {}) => { const query = new URLSearchParams({ page: String(page), perPage: '10' }); if (search) query.set('search', search); const data = await request(`/admin/sections?${query}`); const rows = data?.data || []; return { rows, pagination: { currentPage: data?.current_page || 1, from: data?.from || 0, lastPage: data?.last_page || 1, to: data?.to || rows.length, total: data?.total || rows.length } } }
export const saveSection = (values, id) => request(id ? `/admin/sections/${id}` : '/admin/sections', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(values) })
export const deleteSection = (id) => request(`/admin/sections/${id}`, { method: 'DELETE' })
