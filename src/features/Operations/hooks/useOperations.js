import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import * as service from '../service/operationsService'
const listFunctions = { requisitions: service.getRequisitions, procurements: service.getProcurements, receipts: service.getReceipts, stocks: service.getProductStocks, adjustments: service.getInventoryAdjustments }
export default function useOperations(section) {
  const toast = useToast(); const [items, setItems] = useState([]); const [pagination, setPagination] = useState(service.emptyPagination); const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [options, setOptions] = useState({ products: [], warehouses: [], company_accounts: [] }); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [result, requisitionOptions, stockOptions] = await Promise.all([listFunctions[section]({ page, search }), service.getOptions(), service.getStockOptions()]); setItems(result.rows); setPagination(result.pagination); setOptions({ ...requisitionOptions, warehouses: [...new Set([...(requisitionOptions.warehouses || []), ...(stockOptions.warehouses || [])])] }) } catch (err) { const message = err.message || 'Unable to load operations.'; setError(message); toast.error(message) } finally { setLoading(false) } }, [page, search, section, toast])
  useEffect(() => { const timer = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timer) }, [load])
  const run = async (action, success) => { setSaving(true); try { const result = await action(); toast.success(success); await load(); return result } catch (err) { toast.error(err.message || 'Request failed.'); return null } finally { setSaving(false) } }
  return { items, pagination, page, setPage, search, setSearch, options, loading, saving, error, refresh: load, run }
}
