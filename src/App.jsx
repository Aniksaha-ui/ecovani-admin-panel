import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import FullPageLoader from './components/common/FullPageLoader'
import { ToastProvider } from './components/common/Toaster'
import { APP_ROUTES } from './constants/routes'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { AppLayout } from './layout/AppLayout'

const LoginPage = lazy(() => import('./features/auth/page/LoginPage'))
const UsersPage = lazy(() => import('./features/Users/page/UsersPage'))
const UserComparePage = lazy(() => import('./features/Users/page/UserComparePage'))
const UserProfilePage = lazy(() => import('./features/Users/page/UserProfilePage'))

function ProtectedRoute({ children }) {
  const { auth: { isAuthenticated } } = useAuthContext()
  return isAuthenticated ? children : <Navigate to={APP_ROUTES.login} replace />
}

function GuestRoute({ children }) {
  const { auth: { isAuthenticated } } = useAuthContext()
  return isAuthenticated ? <Navigate to={APP_ROUTES.users} replace /> : children
}

function AppRoutes() {
  const { auth: { isAuthenticated } } = useAuthContext()

  return (
    <Routes>
      <Route
        path={APP_ROUTES.login}
        element={<GuestRoute><Suspense fallback={<FullPageLoader message="Loading login..." />}><LoginPage /></Suspense></GuestRoute>}
      />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to={APP_ROUTES.users} replace />} />
        <Route path={APP_ROUTES.users} element={<Suspense fallback={<FullPageLoader message="Loading users..." />}><UsersPage /></Suspense>} />
        <Route path={APP_ROUTES.userCompare} element={<Suspense fallback={<FullPageLoader message="Loading user comparison..." />}><UserComparePage /></Suspense>} />
        <Route path={APP_ROUTES.userProfile()} element={<Suspense fallback={<FullPageLoader message="Loading user profile..." />}><UserProfilePage /></Suspense>} />
        <Route path="*" element={<Navigate to={APP_ROUTES.users} replace />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? APP_ROUTES.users : APP_ROUTES.login} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider><AppRoutes /></AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
