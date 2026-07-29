import { apiRequest } from '../../../services/apiClient'

const check = (payload, fallback) => { if (payload?.isExecuted === false || payload?.status === false) throw new Error(payload?.message || fallback); return payload?.data }
const list = async (path, { page = 1, search = '' } = {}) => { const query = new URLSearchParams({ page: String(page), perPage: '10' }); if (search) query.set('search', search); const meta = check(await apiRequest(`${path}?${query}`), 'Unable to load records.') || {}; const rows = Array.isArray(meta.data) ? meta.data : []; const pagination = { currentPage: Number(meta.current_page) || 1, from: Number(meta.from) || 0, lastPage: Number(meta.last_page) || 1, to: Number(meta.to) || rows.length, total: Number(meta.total) || rows.length }; return { rows: rows.map((row, index) => ({ ...row, serial: (pagination.from || index + 1) + index })), pagination } }
const send = async (path, method, body) => check(await apiRequest(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), 'Request failed.')

export const getOrders = (params) => list('/admin/orders', params)
export const getOrder = (id) => check(apiRequest(`/admin/orders/${id}`), 'Unable to load order.')
export const updateOrderTracking = (id, body) => send(`/admin/orders/${id}/tracking`, 'POST', body)
export const getTransactions = (params) => list('/admin/transactions', params)
export const getCoupons = (params) => list('/admin/coupons', params)
export const saveCoupon = (values, id) => send(id ? `/admin/coupons/${id}` : '/admin/coupons', id ? 'PATCH' : 'POST', values)
export const deleteCoupon = (id) => check(apiRequest(`/admin/coupons/${id}`, { method: 'DELETE' }), 'Unable to delete coupon.')
