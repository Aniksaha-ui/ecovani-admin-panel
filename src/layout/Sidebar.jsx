import { Boxes, ClipboardList, GalleryVerticalEnd, LayoutDashboard, LogOut, ReceiptText, Tags, Truck, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { APP_ROUTES } from '../constants/routes'
import { useAuthContext } from '../contexts/AuthContext'

const menuItems = [
  { label: 'User Management', to: APP_ROUTES.userManagement, icon: Users },
  { label: 'Commerce', to: APP_ROUTES.commerce, icon: LayoutDashboard },
  { label: 'Catalog', to: APP_ROUTES.catalog, icon: Boxes },
  { label: 'Inventory & Procurement', to: APP_ROUTES.inventory, icon: ClipboardList },
]

export function Sidebar({ isCollapsed, isOpen, onClose }) {
  const { auth, logout, logoutState } = useAuthContext()
  const userInitial = auth.user?.name?.charAt(0)?.toUpperCase() || auth.user?.email?.charAt(0)?.toUpperCase() || 'A'
  const userName = auth.user?.name ?? 'Admin'
  const userEmail = auth.user?.email ?? ''
  const navClass = ({ isActive }) => `flex h-11 items-center rounded-lg text-sm font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-[#1a2d63] text-[#a9c2ff] shadow-[inset_3px_0_0_#4f83ff]' : 'text-[#a7adba] hover:bg-[#211d20] hover:text-white'}`
  return <>{isOpen ? <button aria-label="Close sidebar" className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} /> : null}<aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-[86vw] flex-col border-r border-[#2d282b] bg-[#171314] text-[#a7adba] transition-[width,transform] duration-200 md:static md:w-[280px] md:max-w-none md:translate-x-0 ${isCollapsed ? 'md:w-[76px]' : 'md:w-[280px]'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}><header className={`flex h-[74px] shrink-0 items-center border-b border-[#2d282b] ${isCollapsed ? 'justify-center' : 'gap-3 px-5'}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-orange-600 shadow-sm"><GalleryVerticalEnd size={21} /></div>{isCollapsed ? null : <div className="min-w-0"><p className="truncate text-sm font-bold text-white">VeltraxCRM</p><p className="mt-0.5 text-xs text-[#7d8492]">Admin workspace</p></div>}<button type="button" onClick={onClose} className="ml-auto rounded-lg p-2 text-[#969baa] hover:bg-[#211c1f] hover:text-white md:hidden" aria-label="Close sidebar"><X size={18} /></button></header><nav className={`min-h-0 flex-1 overflow-y-auto ${isCollapsed ? 'px-3 py-4' : 'px-4 py-5'}`}><p className={`mb-2 px-3 text-[11px] font-bold uppercase tracking-[.1em] text-[#656d7c] ${isCollapsed ? 'sr-only' : ''}`}>Workspace</p><div className="space-y-2">{menuItems.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} onClick={onClose} title={isCollapsed ? item.label : undefined} className={navClass}><Icon size={18} />{isCollapsed ? null : <span className="truncate">{item.label}</span>}</NavLink> })}</div></nav><footer className={`shrink-0 border-t border-[#2d282b] ${isCollapsed ? 'p-3' : 'p-4'}`}><div className={`mb-3 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-1'}`}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#274ca6] text-sm font-bold text-white">{userInitial}</div>{isCollapsed ? null : <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{userName}</p><p className="truncate text-xs text-[#777f8e]">{userEmail}</p></div>}</div><button type="button" onClick={() => void logout()} disabled={logoutState.status === 'loading'} title={isCollapsed ? 'Sign out' : undefined} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#513035] text-xs font-semibold text-[#e8a8af] transition hover:border-red-700 hover:bg-red-950/30 disabled:opacity-60"><LogOut size={15} />{isCollapsed ? null : logoutState.status === 'loading' ? 'Signing out...' : 'Sign out'}</button></footer></aside></>
}
