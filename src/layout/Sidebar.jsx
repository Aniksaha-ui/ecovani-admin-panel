import { GalleryVerticalEnd, LogOut, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { APP_ROUTES } from '../constants/routes'
import { useAuthContext } from '../contexts/AuthContext'

export function Sidebar({ isCollapsed, isOpen, onClose }) {
  const { auth, logout, logoutState } = useAuthContext()
  const userInitial = auth.user?.name?.charAt(0)?.toUpperCase() || auth.user?.email?.charAt(0)?.toUpperCase() || 'A'
  const userName = auth.user?.name ?? 'admin'
  const userEmail = auth.user?.email ?? ''

  return (
    <>
      {isOpen && <button aria-label="Close sidebar" className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-[86vw] flex-col border-r border-[#2d282b] bg-[#171314] text-[#969baa] transition-[width,transform] duration-200 md:static md:w-[256px] md:max-w-none md:translate-x-0 ${isCollapsed ? 'md:w-[88px]' : 'md:w-[256px]'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className={`flex h-[74px] items-center border-b border-[#2d282b] ${isCollapsed ? 'justify-center px-3 md:px-0' : 'gap-3 px-4'}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-white text-orange-600"><GalleryVerticalEnd size={22} /></div>
            {isCollapsed ? null : <div className="min-w-0"><p className="truncate text-sm font-bold leading-none text-white">VeltraxCRM</p><p className="mt-1 truncate text-xs text-[#686b77]">User management</p></div>}
            <button type="button" onClick={onClose} className="ml-auto rounded-lg p-2 text-[#969baa] transition hover:bg-[#211c1f] hover:text-white md:hidden" aria-label="Close sidebar"><X size={18} /></button>
          </div>
          <nav className="flex-1 px-3 py-5">
            <NavLink to={APP_ROUTES.users} onClick={onClose} title="Users" className={({ isActive }) => `flex h-10 items-center rounded-lg text-sm font-medium transition ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-[#17214a] text-[#7ea1ff]' : 'text-[#969baa] hover:bg-[#211c1f] hover:text-white'}`}>
              <Users size={17} />
              {isCollapsed ? null : <span>Users</span>}
            </NavLink>
          </nav>
        </div>
        <div className={`border-t border-[#2d282b] p-4 ${isCollapsed ? 'flex flex-col items-center gap-3' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'mb-0 flex-col text-center' : 'mb-3'}`}><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">{userInitial}</div>{isCollapsed ? null : <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{userName}</p><p className="truncate text-xs text-[#686b77]">{userEmail}</p></div>}</div>
          <button type="button" onClick={() => void logout()} disabled={logoutState.status === 'loading'} title={isCollapsed ? 'Sign out' : undefined} className={`flex h-9 items-center justify-center gap-2 rounded-lg border border-red-800/70 text-xs font-semibold text-red-300 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-60 ${isCollapsed ? 'w-9' : 'w-full'}`}><LogOut size={15} />{isCollapsed ? null : logoutState.status === 'loading' ? 'Signing out...' : 'Sign Out'}</button>
        </div>
      </aside>
    </>
  )
}
