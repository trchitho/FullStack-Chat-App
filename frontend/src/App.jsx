import { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import {Routes ,Route, Navigate, useLocation} from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore' 
import {Loader} from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SocialProfilePage = lazy(() => import("./pages/SocialProfilePage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const MessageRequestsPage = lazy(() => import("./pages/MessageRequestsPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const PoliciesCenterPage = lazy(() => import("./pages/PoliciesCenterPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const RouteFallback = () => (
  <div role="status" aria-live="polite" className="flex min-h-dvh items-center justify-center">
    <Loader className="size-8 animate-spin" aria-hidden="true" />
    <span className="sr-only">Đang tải trang</span>
  </div>
);

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  const {theme} = useThemeStore();
  const location = useLocation();
  const standalonePage = location.pathname.startsWith("/help") || location.pathname.startsWith("/policies_center") || location.pathname.startsWith("/admin");
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
      {!isOnline && (
        <div role="alert" className="bg-error text-error-content px-4 py-2 text-center text-sm font-semibold sticky top-0 z-[400]">
          ⚠️ Bạn đang ngoại tuyến. Một số tính năng như tin nhắn thời gian thực có thể bị tạm dừng.
        </div>
      )}

      <a href="#main-content" className="sr-only z-[300] rounded-lg bg-primary px-4 py-2 text-primary-content focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Bỏ qua tới nội dung chính
      </a>

      {!standalonePage && <Navbar />}

      <div id="main-content" tabIndex="-1">
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
      </div>
      
      <Toaster />

    </div>
  )
}

export default App
