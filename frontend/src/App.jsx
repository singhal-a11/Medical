import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import ManageTests from './pages/ManageTests'
import ManageUsers from './pages/ManageUsers'
import PatientsList from './pages/PatientsList'
import CreateRequest from './pages/CreateRequest'
import DoctorReports from './pages/DoctorReports'
import PendingRequests from './pages/PendingRequests'
import GenerateReport from './pages/GenerateReport'
import PatientDashboard from './pages/PatientDashboard'

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tests" element={<ProtectedRoute><ManageTests /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute><PatientsList /></ProtectedRoute>} />
        <Route path="/doctor/request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
        <Route path="/doctor/reports" element={<ProtectedRoute><DoctorReports /></ProtectedRoute>} />
        <Route path="/tech/requests" element={<ProtectedRoute><PendingRequests /></ProtectedRoute>} />
        <Route path="/tech/report/:requestId" element={<ProtectedRoute><GenerateReport /></ProtectedRoute>} />
        <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
