import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import { emptyPagination, getCategories, removeCategory, saveCategory } from '../service/categoriesService'

export default function useCategories() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async (overrides = {}) => {
    setIsLoading(true); setError('')
    try { const result = await getCategories({ page: overrides.page ?? page, search: overrides.search ?? search }); setItems(result.rows); setPagination(result.pagination) }
    catch (err) { const message = err.message || 'Unable to load categories.'; setError(message); toast.error(message) }
    finally { setIsLoading(false) }
  }, [page, search, toast])
  useEffect(() => { const timeoutId = window.setTimeout(() => { void load() }, 0); return () => window.clearTimeout(timeoutId) }, [load])
  const save = async (values, id) => { setIsSaving(true); try { await saveCategory(values, id); toast.success(id ? 'Category updated.' : 'Category created.'); await load(); return true } catch (err) { toast.error(err.message || 'Unable to save category.'); return false } finally { setIsSaving(false) } }
  const destroy = async (id) => { try { await removeCategory(id); toast.success('Category deleted.'); await load(); return true } catch (err) { toast.error(err.message || 'Unable to delete category.'); return false } }
  return { items, pagination, page, setPage, search, setSearch, isLoading, isSaving, error, refresh: load, save, destroy }
}
