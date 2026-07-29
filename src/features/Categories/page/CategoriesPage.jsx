import { FolderPlus, Plus, RefreshCcw, Tags } from 'lucide-react'
import { useState } from 'react'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { categoryActions, categoryColumns } from '../component/categoryColumns'
import CategoryFormModal from '../component/CategoryFormModal'
import useCategories from '../hooks/useCategories'

export default function CategoriesPage() {
  const api = useCategories(); const [editing, setEditing] = useState(null); const [formOpen, setFormOpen] = useState(false)
  const actions = categoryActions({ onEdit: (item) => { setEditing(item); setFormOpen(true) }, onDelete: async (item) => { if (window.confirm(`Delete “${item.name}”? Products assigned to it may prevent deletion.`)) await api.destroy(item.id) } })
  return <main className="routes-page"><div className="routes-page__inner"><header className="routes-page__header"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="routes-page__title"><Tags size={20} color="#4f83ff" /><h1>Categories</h1></div><p className="routes-page__subtitle">Organize the product catalog with clear, reusable categories.</p></div><div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-4 text-sm font-semibold text-[#c5d9f7]"><FolderPlus size={16} />{api.pagination.total} categories</div></div></header>{api.error ? <p className="month-balance-alert">{api.error}</p> : null}<AdminDataTable columns={categoryColumns} data={api.items} isLoading={api.isLoading} pagination={api.pagination} search={api.search} searchPlaceholder="Search categories" onPageChange={api.setPage} onSearchChange={(value) => { api.setPage(1); api.setSearch(value) }} resultLabel={`Showing ${api.items.length} of ${api.pagination.total} categories`} renderRowActions={actions} actions={<><AdminTableButton disabled={api.isLoading} onClick={() => api.refresh()}><RefreshCcw size={14} />Refresh</AdminTableButton><AdminTableButton variant="blue" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus size={14} />New category</AdminTableButton></>} emptyMessage="No categories found." /></div>{formOpen ? <CategoryFormModal key={editing?.id ?? 'new'} category={editing} isSaving={api.isSaving} onClose={() => setFormOpen(false)} onSave={api.save} /> : null}</main>
}
