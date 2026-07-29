import { apiRequest } from '../../../services/apiClient'

const check = (payload, fallback) => { if (payload?.isExecuted === false) throw new Error(payload?.message || fallback); return payload?.data }
const request = async (path, options) => check(await apiRequest(path, options), 'Company account request failed.')
export const listCompanyAccounts = async ({ page = 1, search = '' } = {}) => { const query = new URLSearchParams({ page: String(page), perPage: '10' }); if (search) query.set('search', search); const data = await request(`/admin/company-accounts?${query}`); const rows = data?.data || []; return { rows, pagination: { currentPage: data?.current_page || 1, from: data?.from || 0, lastPage: data?.last_page || 1, to: data?.to || rows.length, total: data?.total || rows.length } } }
export const saveCompanyAccount = (values, id) => request(id ? `/admin/company-accounts/${id}` : '/admin/company-accounts', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(values) })
export const deleteCompanyAccount = (id) => request(`/admin/company-accounts/${id}`, { method: 'DELETE' })
