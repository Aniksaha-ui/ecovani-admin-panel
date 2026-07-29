import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'

const emptyPagination = { currentPage: 1, from: 0, lastPage: 1, to: 0, total: 0 }
const check = (payload, fallback) => { if (payload?.isExecuted === false || payload?.status === false) throw new Error(payload?.message || fallback); return payload?.data }
const list = async (url, { page = 1, search = '', filters = {} } = {}) => { const query = new URLSearchParams({ page: String(page), perPage: '10' }); if (search) query.set('search', search); Object.entries(filters).forEach(([key, value]) => { if (value !== '' && value !== null && value !== undefined) query.set(key, value) }); const meta = check(await apiRequest(`${url}?${query}`), 'Unable to load records.') || {}; const rows = Array.isArray(meta.data) ? meta.data : []; const pagination = { currentPage: Number(meta.current_page) || 1, from: Number(meta.from) || 0, lastPage: Number(meta.last_page) || 1, to: Number(meta.to) || rows.length, total: Number(meta.total) || rows.length }; return { rows: rows.map((row, index) => ({ ...row, serial: (pagination.from || index + 1) + index })), pagination } }
const post = async (url, data, fallback) => check(await apiRequest(url, { method: 'POST', body: JSON.stringify(data) }), fallback)

export const getOptions = async () => check(await apiRequest(API_URLS.admin.requisitionOptions), 'Unable to load options.') || {}
export const getStockOptions = async () => check(await apiRequest(API_URLS.admin.productStockOptions), 'Unable to load stock options.') || {}
export const getRequisitions = (params) => list(API_URLS.admin.requisitions, params)
export const createRequisition = (data) => post(API_URLS.admin.requisitions, data, 'Unable to create requisition.')
export const acceptRequisition = (id) => post(`${API_URLS.admin.requisitions}/${id}/accept`, {}, 'Unable to accept requisition.')
export const getProcurements = (params) => list(API_URLS.admin.procurements, params)
export const receiveProcurement = (id, data) => post(`${API_URLS.admin.procurements}/${id}/receive`, data, 'Unable to receive procurement.')
export const markProcurementOnHand = (id, data) => post(`${API_URLS.admin.procurements}/${id}/on-hand`, data, 'Unable to mark procurement on hand.')
export const getReceipts = (params) => list(API_URLS.admin.stockReceipts, params)
export const getReceipt = async (id) => check(await apiRequest(`${API_URLS.admin.stockReceipts}/${id}`), 'Unable to load stock receipt.')
export const createReceipt = (data) => post(API_URLS.admin.stockReceipts, data, 'Unable to create stock receipt.')
export const getProductStocks = (params) => list(API_URLS.admin.productStocks, params)
export const getInventoryAdjustments = (params) => list(API_URLS.admin.inventoryAdjustments, params)
export const getInventoryAdjustment = async (id) => check(await apiRequest(`${API_URLS.admin.inventoryAdjustments}/${id}`), 'Unable to load inventory adjustment.')
export const saveProductStock = (data) => post(API_URLS.admin.productStocks, data, 'Unable to save stock.')
export const adjustProductStock = (id, data) => post(`${API_URLS.admin.productStocks}/${id}`, data, 'Unable to adjust stock.')
export { emptyPagination }
