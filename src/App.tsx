import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CalendarPage from './pages/CalendarPage'
import PastActivitiesPage from './pages/PastActivitiesPage'
import FutureActivitiesPage from './pages/FutureActivitiesPage'
import GalleryPage from './pages/GalleryPage'
import DonationsPage from './pages/DonationsPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import KSIBPage from './pages/KSIBPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#b34700', fontWeight: 600, fontSize: '1.1rem' }}>
      Memuatkan...
    </div>
  )
  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fdf6f0' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/calendar"   element={<CalendarPage />} />
          <Route path="/activities" element={<PastActivitiesPage />} />
          <Route path="/upcoming"   element={<FutureActivitiesPage />} />
          <Route path="/gallery"    element={<GalleryPage />} />
          <Route path="/donations"  element={<DonationsPage />} />
          <Route path="/ksib"       element={<KSIBPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/admin"      element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer style={{ background: 'linear-gradient(135deg, #8a3200, #e8671a)', color: 'white', textAlign: 'center', fontSize: '0.8rem', padding: '14px 24px', marginTop: 'auto' }}>
        © 2026 SM Sains Kubang Pasu · Batch Salahuddin Al-Ayubi · KSIB · Dashboard SPM 2026
      </footer>
    </div>
  )
}
