import React from 'react'
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { ProtectedRoute } from './routes/ProtectedRoute'
import AdminProtectedRoute from './routes/AdminProtectedRoute'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'
import Page404 from './pages/Page404'
import LoginPage from './pages/LoginPage'
import BillingPage from './pages/BillingPage'
import ClinicPage from './pages/ClinicPage'
import PatientsPage from './pages/PatientsPage'
import LongTermReportPage from './pages/LongTermReportPage'
import QuickShareReportPage from './pages/QuickShareReportPage'
import CustomProvider from 'rsuite/CustomProvider'
import { LTRServicesProvider } from './context/LTRServicesContext'
import SamplesPage from './pages/SamplesPage'
import QuickSharedReportSamplesPage from './pages/QuickShareReportSamplesPage'

function App() {
  return (
    <div className="App">
      <CustomProvider theme="light">
        <BrowserRouter>
          <AuthProvider>
            <LTRServicesProvider>
              <AppRoutes />
            </LTRServicesProvider>
          </AuthProvider>
        </BrowserRouter>
      </CustomProvider>
    </div>
  )
}

const AppRoutes: React.FC = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="*" element={<Page404 />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <SignUpPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute user={user}>
            <PatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinic"
        element={
          <AdminProtectedRoute>
            <ClinicPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <AdminProtectedRoute>
            <BillingPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/report/:id"
        element={
          <ProtectedRoute user={user}>
            <LongTermReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report/daily/:id/:date"
        element={
          <ProtectedRoute user={user}>
            <SamplesPage />
          </ProtectedRoute>
        }
      />
      <Route path="/quick-shared-report/:accessRequestId/:id" element={<QuickShareReportPage />} />
      <Route
        path="/quick-shared-report/daily/:id/:date"
        element={<QuickSharedReportSamplesPage />}
      />
    </Routes>
  )
}

export default App
