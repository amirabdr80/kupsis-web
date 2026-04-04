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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-primary font-semibold">Memuatkan...</div>
  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/calendar"   element={<CalendarPage />} />
          <Route path="/activities" element={<PastActivitiesPage />} />
          <Route path="/upcoming"   element={<FutureActivitiesPage />} />
          <Route path="/gallery"    element={<GalleryPage />} />
          <Route path="/donations"  element={<DonationsPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/admin"      element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="bg-primary text-white text-center text-xs py-3 mt-8 opacity-80">
        KUPSIS Road to SPM 2026 · F5 Salahuddin Al-Ayubi · KSIB
      </footer>
    </div>
  )
}
