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
import { useAuthStore } from './store/useAuthStore' 
import {Loader} from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  const {theme} = useThemeStore();
  const location = useLocation();
  const standalonePage = location.pathname.startsWith("/help") || location.pathname.startsWith("/policies_center");
  

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );


  return (
    <div data-theme = {theme}>

      {!standalonePage && <Navbar />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
        <Route path="/help/messages-app/" element={<HelpCenterPage />} />
        <Route path="/policies_center" element={<PoliciesCenterPage />} />
      </Routes>
      
      <Toaster />

    </div>
  )
}

export default App
