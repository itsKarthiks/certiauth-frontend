import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VerificationLanding from './components/VerificationLanding'
import AuthGateway from './components/AuthGateway'
import AdminDashboard from './components/AdminDashboard'
import CertificateLogs from './components/CertificateLogs'
import IssueCertificate from './components/IssueCertificate'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VerificationLanding />} />
        <Route path="/login" element={<AuthGateway />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/logs" element={<CertificateLogs />} />
        <Route path="/issue" element={<IssueCertificate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
