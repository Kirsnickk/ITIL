import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AssetsPage from './pages/AssetsPage'
import AssetDetailPage from './pages/AssetDetailPage'
import ProcurementPage from './pages/ProcurementPage'
import LicensesPage from './pages/LicensesPage'
import DepartmentsPage from './pages/DepartmentsPage'
import LocationsPage from './pages/LocationsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const { token } = useAuthStore()

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      </Route>

      {/* Private routes */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
        <Route path="/procurement" element={<ProcurementPage />} />
        <Route path="/licenses" element={<LicensesPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
