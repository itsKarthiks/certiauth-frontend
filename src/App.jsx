import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VerificationLanding from './components/VerificationLanding'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import CertificateLogs from './components/CertificateLogs'
import IssueCertificate from './components/IssueCertificate'
import AdminRoute from './components/AdminRoute'
import StudentDashboard from './components/StudentDashboard'
import CertificatePreview from './components/CertificatePreview'
import CorrectionForm from './components/CorrectionForm'
import CertificateDownload from './components/CertificateDownload'
import AuthGateway from './components/AuthGateway'
import AdminNotifications from './components/AdminNotifications';
import AdminResolve from './components/AdminResolve';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VerificationLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/logs" element={<AdminRoute><CertificateLogs /></AdminRoute>} />
        <Route path="/issue" element={<AdminRoute><IssueCertificate /></AdminRoute>} />
        <Route path="/student-portal" element={<StudentDashboard />} />
        <Route path="/verify" element={<VerificationLanding />} />
        <Route path="/preview" element={<CertificatePreview />} />
        <Route path="/correction" element={<CorrectionForm />} />
        <Route path="/download" element={<CertificateDownload />} />
        <Route path="/admin-login" element={<AuthGateway />} />
        <Route path="/notifications" element={<AdminNotifications />} />
        <Route path="/resolve" element={<AdminResolve />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
