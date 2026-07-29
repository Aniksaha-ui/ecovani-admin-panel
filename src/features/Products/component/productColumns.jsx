import { Pencil, Trash2 } from 'lucide-react'
export const productColumns = [
  { id: 'serial', label: 'SL', accessor: 'serial', width: '65px' },
  { id: 'name', label: 'Product', width: '27%', render: (item) => <div><p className="font-semibold text-white">{item.name}</p><p className="text-xs text-[#7d8ca5]">{item.sku || 'No SKU'}</p></div> },
  { id: 'category_name', label: 'Category', render: (item) => <div className="text-sm text-[#dbe7fb]"><p>{item.category_name}</p><p className="text-xs text-[#7d8ca5]">{item.subcategory_name}</p></div>, width: '19%' },
  { id: 'price', label: 'Price', render: (item) => `৳${Number(item.price || 0).toLocaleString()}`, width: '12%' },
  { id: 'stock_quantity', label: 'Stock', render: (item) => <span className={Number(item.stock_quantity) > 0 ? 'text-emerald-300' : 'text-red-300'}>{item.stock_quantity ?? 0}</span>, width: '10%' },
  { id: 'is_active', label: 'Status', render: (item) => <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.is_active ? 'border-emerald-700/70 bg-emerald-950/40 text-emerald-300' : 'border-[#594449] bg-[#2a2023] text-[#c3aeb3]'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>, width: '11%' },
]
export const productActions = ({ onEdit, onDelete }) => (item) => <div className="flex justify-end gap-2"><button className="admin-row-action" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><Pencil size={15} /></button><button className="admin-row-action admin-row-action--danger" onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></div>
