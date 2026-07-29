/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarCollapsed = false
  const location = useLocation()
  const title = location.pathname.endsWith('/compare') ? 'User Compare' : location.pathname.endsWith('/profile') ? 'User Profile' : 'User Management'

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const handleSidebarToggle = () => {
    if (window.matchMedia('(max-width: 767px)').matches) return setSidebarOpen((currentValue) => !currentValue)
    return undefined
  }

  return <div className="flex min-h-dvh bg-[#100d0e] text-slate-200"><Sidebar isCollapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><main className="flex min-w-0 flex-1 flex-col"><Navbar title={title} onMenuClick={handleSidebarToggle} /><div className="flex-1 overflow-y-auto bg-[#100d0e]"><Outlet /></div><Footer /></main></div>
}
