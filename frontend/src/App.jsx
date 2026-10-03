import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import CloudStackLayout from './components/CloudStackLayout.jsx'
import {
  DashboardPage, DeploymentHistoryPage, DeployPage, GitHubPage, LoginPage,
  ProfilePage, RegisterPage, TemplateDetailsPage, TemplateEditorPage, TemplatesPage,
} from './pages/Pages.jsx'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cloudstack-user') || 'null') } catch { return null }
  })
  useEffect(() => {
    if (user) localStorage.setItem('cloudstack-user', JSON.stringify(user))
    else localStorage.removeItem('cloudstack-user')
  }, [user])
  const logout = () => setUser(null)
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={setUser} />} />
      <Route element={user ? <CloudStackLayout user={user} onLogout={logout} /> : <Navigate to="/login" replace />}>
        <Route index element={<DashboardPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/new" element={<TemplateEditorPage />} />
        <Route path="/templates/:id/edit" element={<TemplateEditorPage />} />
        <Route path="/templates/:id" element={<TemplateDetailsPage />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/deployments" element={<DeploymentHistoryPage />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/github" element={<GitHubPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}
