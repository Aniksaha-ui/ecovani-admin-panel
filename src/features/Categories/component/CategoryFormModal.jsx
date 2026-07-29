import { X } from 'lucide-react'
import { useState } from 'react'

export default function CategoryFormModal({ category, isSaving, onClose, onSave }) {
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const submit = async (event) => { event.preventDefault(); if ((await onSave({ name: name.trim(), description: description.trim() || null }, category?.id))) onClose() }
  return <div className="admin-modal-backdrop" role="presentation"><form className="admin-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-label="Category form"><div className="admin-modal__header"><div><h2>{category ? 'Edit category' : 'New category'}</h2><p>Use clear names to keep product organization simple.</p></div><button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><label className="admin-field">Name<input required maxLength="100" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Home essentials" /></label><label className="admin-field">Description<textarea rows="4" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional category description" /></label><div className="admin-modal__actions"><button type="button" className="routes-control" onClick={onClose}>Cancel</button><button className="routes-control routes-control--blue" disabled={isSaving}>{isSaving ? 'Saving...' : category ? 'Save changes' : 'Create category'}</button></div></form></div>
}
