import { useEffect } from 'react'
import Navbar from './components/Navbar'
import {Routes ,Route, Navigate, useLocation} from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import HelpCenterPage from './pages/HelpCenterPage'
import PoliciesCenterPage from './pages/PoliciesCenterPage'
import AdminPage from './pages/AdminPage'
import ContactsPage from './pages/ContactsPage'
import SocialProfilePage from './pages/SocialProfilePage'
import TimelinePage from './pages/TimelinePage'
import MessageRequestsPage from './pages/MessageRequestsPage'
import { useAuthStore } from './store/useAuthStore' 
import {Loader} from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  const {theme} = useThemeStore();
  const location = useLocation();
  const standalonePage = location.pathname.startsWith("/help") || location.pathname.startsWith("/policies_center") || location.pathname.startsWith("/admin");
  

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div role="status" aria-live="polite" className="flex min-h-dvh items-center justify-center">
        <Loader className="size-10 animate-spin" aria-hidden="true" />
        <span className="sr-only">Đang kiểm tra phiên đăng nhập</span>
      </div>
    );


  return (
    <div data-theme = {theme}>
      <a href="#main-content" className="sr-only z-[300] rounded-lg bg-primary px-4 py-2 text-primary-content focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Bỏ qua tới nội dung chính
      </a>

      {!standalonePage && <Navbar />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <Navigate to="/profile/me" /> : <Navigate to='/login' />} />
        <Route path="/profile/legacy" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
        <Route path="/profile/:userId" element={authUser ? <SocialProfilePage /> : <Navigate to='/login' />} />
        <Route path="/contacts" element={authUser ? <ContactsPage /> : <Navigate to='/login' />} />
        <Route path="/timeline" element={authUser ? <TimelinePage /> : <Navigate to='/login' />} />
        <Route path="/message-requests" element={authUser ? <MessageRequestsPage /> : <Navigate to='/login' />} />
        <Route path="/help" element={<Navigate to="/help/messages-app/" />} />
        <Route path="/help/messages-app/" element={<HelpCenterPage />} />
        <Route path="/policies_center" element={<PoliciesCenterPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      
      <Toaster />

    </div>
  )
}

export default App
