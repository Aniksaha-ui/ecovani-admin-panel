/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'travel-agency-admin-sidebar-collapsed'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getPersistedSidebarCollapsed)
  const location = useLocation()
  const title = location.pathname.endsWith('/compare') ? 'User Compare' : location.pathname.endsWith('/profile') ? 'User Profile' : 'User Management'

  useEffect(() => { window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, JSON.stringify(sidebarCollapsed)) }, [sidebarCollapsed])
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const handleSidebarToggle = () => {
    if (window.matchMedia('(max-width: 767px)').matches) return setSidebarOpen((currentValue) => !currentValue)
    setSidebarCollapsed((currentValue) => !currentValue)
  }

  return <div className="flex min-h-dvh bg-[#100d0e] text-slate-200"><Sidebar isCollapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><main className="flex min-w-0 flex-1 flex-col"><Navbar isSidebarCollapsed={sidebarCollapsed} title={title} onMenuClick={handleSidebarToggle} /><div className="flex-1 overflow-y-auto bg-[#100d0e]"><Outlet /></div><Footer /></main></div>
}

function getPersistedSidebarCollapsed() {
  try { return JSON.parse(window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY)) === true } catch { return false }
}
