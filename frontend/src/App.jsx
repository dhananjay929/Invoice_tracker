import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import InvoiceCreate from './pages/InvoiceCreate'
import InvoiceDetail from './pages/InvoiceDetail'
import Clients from './pages/Clients'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  const user  = localStorage.getItem('user')
  if (!token || !user) return <Navigate to="/login" replace />
  return children
}
function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1a1e29', color: '#f0f2f8', border: '1px solid rgba(255,255,255,0.07)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' } }} />
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index              element={<Dashboard />} />
            <Route path="invoices"    element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceCreate />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="clients"     element={<Clients />} />
            <Route path="expenses"    element={<Expenses />} />
            <Route path="reports"     element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
