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
const CategoriesPage = lazy(() => import('./features/Categories/page/CategoriesPage'))
const SubcategoriesPage = lazy(() => import('./features/Subcategories/page/SubcategoriesPage'))
const SectionsPage = lazy(() => import('./features/Sections/page/SectionsPage'))
const SectionProductsPage = lazy(() => import('./features/SectionProducts/page/SectionProductsPage'))
const ProductsPage = lazy(() => import('./features/Products/page/ProductsPage'))
const ProductBundlesPage = lazy(() => import('./features/ProductBundles/page/ProductBundlesPage'))
const OperationsPage = lazy(() => import('./features/Operations/page/OperationsPage'))
const CommercePage = lazy(() => import('./features/Commerce/page/CommercePage'))
const CompanyAccountsPage = lazy(() => import('./features/CompanyAccounts/page/CompanyAccountsPage'))
const MenuHubPage = lazy(() => import('./features/MenuHub/page/MenuHubPage'))

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
        <Route path={APP_ROUTES.userManagement} element={<Suspense fallback={<FullPageLoader message="Loading user management..." />}><MenuHubPage hub="users" /></Suspense>} />
        <Route path={APP_ROUTES.commerce} element={<Suspense fallback={<FullPageLoader message="Loading commerce..." />}><MenuHubPage hub="commerce" /></Suspense>} />
        <Route path={APP_ROUTES.catalog} element={<Suspense fallback={<FullPageLoader message="Loading catalog..." />}><MenuHubPage hub="catalog" /></Suspense>} />
        <Route path={APP_ROUTES.inventory} element={<Suspense fallback={<FullPageLoader message="Loading inventory..." />}><MenuHubPage hub="inventory" /></Suspense>} />
        <Route path={APP_ROUTES.categories} element={<Suspense fallback={<FullPageLoader message="Loading categories..." />}><CategoriesPage /></Suspense>} />
        <Route path={APP_ROUTES.subcategories} element={<Suspense fallback={<FullPageLoader message="Loading subcategories..." />}><SubcategoriesPage /></Suspense>} />
        <Route path={APP_ROUTES.sections} element={<Suspense fallback={<FullPageLoader message="Loading sections..." />}><SectionsPage /></Suspense>} />
        <Route path={APP_ROUTES.sectionProducts} element={<Suspense fallback={<FullPageLoader message="Loading section products..." />}><SectionProductsPage /></Suspense>} />
        <Route path={APP_ROUTES.products} element={<Suspense fallback={<FullPageLoader message="Loading products..." />}><ProductsPage /></Suspense>} />
        <Route path={APP_ROUTES.productBundles} element={<Suspense fallback={<FullPageLoader message="Loading product bundles..." />}><ProductBundlesPage /></Suspense>} />
        <Route path={APP_ROUTES.requisitions} element={<Suspense fallback={<FullPageLoader message="Loading operations..." />}><OperationsPage section="requisitions" /></Suspense>} />
        <Route path={APP_ROUTES.procurements} element={<Suspense fallback={<FullPageLoader message="Loading operations..." />}><OperationsPage section="procurements" /></Suspense>} />
        <Route path={APP_ROUTES.stockReceipts} element={<Suspense fallback={<FullPageLoader message="Loading operations..." />}><OperationsPage section="receipts" /></Suspense>} />
        <Route path={APP_ROUTES.productStocks} element={<Suspense fallback={<FullPageLoader message="Loading operations..." />}><OperationsPage section="stocks" /></Suspense>} />
        <Route path={APP_ROUTES.inventoryAdjustments} element={<Suspense fallback={<FullPageLoader message="Loading operations..." />}><OperationsPage section="adjustments" /></Suspense>} />
        <Route path={APP_ROUTES.orders} element={<Suspense fallback={<FullPageLoader message="Loading orders..." />}><CommercePage section="orders" /></Suspense>} />
        <Route path={APP_ROUTES.transactions} element={<Suspense fallback={<FullPageLoader message="Loading transactions..." />}><CommercePage section="transactions" /></Suspense>} />
        <Route path={APP_ROUTES.coupons} element={<Suspense fallback={<FullPageLoader message="Loading coupons..." />}><CommercePage section="coupons" /></Suspense>} />
        <Route path={APP_ROUTES.companyAccounts} element={<Suspense fallback={<FullPageLoader message="Loading company accounts..." />}><CompanyAccountsPage /></Suspense>} />
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
