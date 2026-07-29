import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import { emptyPagination, getProduct, getProductOptions, getProducts, removeProduct, saveProduct } from '../service/productsService'
export default function useProducts() {
  const toast = useToast(); const [items, setItems] = useState([]); const [pagination, setPagination] = useState(emptyPagination); const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [options, setOptions] = useState({ categories: [], subcategories: [], sections: [] }); const [isLoading, setIsLoading] = useState(true); const [isSaving, setIsSaving] = useState(false); const [error, setError] = useState('')
  const load = useCallback(async (overrides = {}) => { setIsLoading(true); setError(''); try { const [products, productOptions] = await Promise.all([getProducts({ page: overrides.page ?? page, search: overrides.search ?? search }), getProductOptions()]); setItems(products.rows); setPagination(products.pagination); setOptions(productOptions) } catch (err) { const message = err.message || 'Unable to load products.'; setError(message); toast.error(message) } finally { setIsLoading(false) } }, [page, search, toast])
  useEffect(() => { const timeoutId = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timeoutId) }, [load])
  const edit = async (id) => { try { return await getProduct(id) } catch (err) { toast.error(err.message || 'Unable to load product.'); return null } }
  const save = async (values, id) => { setIsSaving(true); try { await saveProduct(values, id); toast.success(id ? 'Product updated.' : 'Product created.'); await load(); return true } catch (err) { toast.error(err.message || 'Unable to save product.'); return false } finally { setIsSaving(false) } }
  const destroy = async (id) => { try { await removeProduct(id); toast.success('Product deleted.'); await load(); return true } catch (err) { toast.error(err.message || 'Unable to delete product.'); return false } }
  return { items, pagination, page, setPage, search, setSearch, options, isLoading, isSaving, error, refresh: load, edit, save, destroy }
}
