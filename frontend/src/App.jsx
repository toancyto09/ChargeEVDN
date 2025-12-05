import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { Logo } from './components/common/Logo';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

// Feature-based imports
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import GoogleCallbackPage from './features/auth/pages/GoogleCallbackPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import MapPage from './features/map/pages/MapPage';
import { ProfilePage } from './features/profile/pages';
import { VehiclesPage } from './features/vehicles/pages';
import { StationDetailPage } from './features/station/pages';
import MyBookingsPage from './features/booking/pages/MyBookingsPage';
import StationReviewsPage from './features/rating/pages/StationReviewsPage';
import PaymentSuccessPage from './features/payments/pages/PaymentSuccessPage';
import PaymentFailedPage from './features/payments/pages/PaymentFailedPage';
import PaymentHistoryPage from './features/payments/pages/PaymentHistoryPage';
import BottomNav from './components/layout/BottomNav';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Re-check isLoggedIn whenever location changes
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Update isLoggedIn whenever location changes
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  // Also listen to storage events (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Use location.pathname instead of window.location.pathname
  const isMapPage = location.pathname === '/map';

  const isProtectedPage =
    location.pathname === '/dashboard' ||
    location.pathname === '/notifications' ||
    location.pathname === '/settings' ||
    location.pathname === '/route' ||
    location.pathname === '/vehicles' ||
    location.pathname === '/bookings' ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/stations/') ||
    location.pathname.startsWith('/payment/');

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Mobile-First Header - Hide on map, protected pages, and auth pages */}
      {!isMapPage && !isProtectedPage && !isAuthPage && (
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo - responsive sizes */}
              <Logo
                size="sm" // Mobile
                className="sm:hidden"
              />
              <Logo
                size="md" // Tablet
                className="hidden sm:block lg:hidden"
              />
              <Logo
                size="lg" // Desktop
                className="hidden lg:block"
              />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-foreground hover:text-primary transition-colors btn-touch"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                <a
                  href="#"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  🗺️ Tìm trạm
                </a>
                <a
                  href="#"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  📅 Đặt chỗ
                </a>
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    className="bg-primary text-primary-foreground px-3 py-2 lg:px-4 lg:py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-primary text-primary-foreground px-3 py-2 lg:px-4 lg:py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )}
              </nav>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t pt-4 animate-in slide-in-from-top-2">
                <nav className="flex flex-col gap-4">
                  <a
                    href="#"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 btn-touch"
                  >
                    🗺️ Tìm trạm sạc
                  </a>
                  <a
                    href="#"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 btn-touch"
                  >
                    📅 Đặt chỗ
                  </a>
                  <a
                    href="#"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 btn-touch"
                  >
                    📱 Tải ứng dụng
                  </a>
                  {isLoggedIn ? (
                    <Link
                      to="/dashboard"
                      className="bg-primary text-primary-foreground px-4 py-3 rounded-md text-base font-medium hover:bg-primary/90 transition-colors w-full mt-2 btn-touch text-center"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="bg-primary text-primary-foreground px-4 py-3 rounded-md text-base font-medium hover:bg-primary/90 transition-colors w-full mt-2 btn-touch text-center"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content - No padding for map, protected pages, and auth pages */}
      <main
        className={
          isMapPage || isProtectedPage || isAuthPage
            ? ''
            : 'container mx-auto px-4 py-4 sm:py-6 lg:py-8'
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage />
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/auth/google/callback"
            element={<GoogleCallbackPage />}
          />

          {/* Public Map - No login required */}
          <Route path="/map" element={<MapPage />} />

          {/* Protected routes - Login required */}
          <Route
            path="/dashboard"
            element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/route"
            element={
              isLoggedIn ? (
                <ComingSoonPage title="Lộ trình" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              isLoggedIn ? (
                <ComingSoonPage title="Thông báo" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isLoggedIn ? (
                <ComingSoonPage title="Cài đặt" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/vehicles"
            element={isLoggedIn ? <VehiclesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/stations/:id"
            element={
              isLoggedIn ? <StationDetailPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/bookings"
            element={isLoggedIn ? <MyBookingsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/stations/:id/reviews"
            element={<StationReviewsPage />}
          />

          {/* Payment routes */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route 
            path="/payment/history" 
            element={isLoggedIn ? <PaymentHistoryPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>

      {/* Bottom Navigation - Show on map and protected pages */}
      {(isMapPage || isProtectedPage) && <BottomNav />}

      <Toaster position="top-center" className="sm:top-right" />
    </div>
  );
}

// Coming Soon Page
function ComingSoonPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center px-4">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600">Tính năng đang được phát triển</p>
    </div>
  );
}

// Mobile-First Welcome Page
function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[60vh] text-center">
      {/* Hero Section - Responsive */}
      <div className="mb-6 sm:mb-8 relative w-full max-w-md sm:max-w-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 rounded-full blur-2xl sm:blur-3xl opacity-20 scale-90"></div>
        <div className="relative flex flex-col items-center gap-3 sm:gap-4">
          {/* Logo - Different sizes for different screens */}
          <Logo
            size="xl" // Mobile
            showText={false}
            className="sm:hidden"
          />
          <Logo
            size="2xl" // Tablet & Desktop
            showText={false}
            className="hidden sm:block"
          />

          {/* Title - Responsive text size */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-green-light bg-clip-text text-transparent mb-2">
            ChargeEVDN
          </h1>
        </div>
      </div>

      {/* Subtitle - Responsive */}
      <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-sm sm:max-w-2xl px-4 sm:px-0">
        Hệ thống quản lý và đặt chỗ trạm sạc xe điện
      </p>

      {/* Feature Cards - Mobile-first grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-sm sm:max-w-4xl px-4 sm:px-0">
        <FeatureCard
          icon="🗺️"
          title="Tìm trạm sạc"
          description="Tìm kiếm trạm sạc gần nhất"
        />
        <FeatureCard
          icon="📅"
          title="Đặt chỗ"
          description="Đặt chỗ trước khi đến trạm"
        />
        <FeatureCard
          icon="💳"
          title="Thanh toán"
          description="Thanh toán dễ dàng qua VNPAY"
        />
        <FeatureCard
          icon="⭐"
          title="Đánh giá"
          description="Đánh giá chất lượng dịch vụ"
        />
      </div>

      {/* CTA Buttons - Mobile-first */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none px-4 sm:px-0">
        <Link
          to="/register"
          className="bg-primary text-primary-foreground px-6 py-3 sm:py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg text-base sm:text-sm w-full sm:w-auto btn-touch text-center"
        >
          🚗 Bắt đầu ngay
        </Link>
        <Link
          to="/login"
          className="border border-primary text-primary px-6 py-3 sm:py-3 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors text-base sm:text-sm w-full sm:w-auto btn-touch text-center"
        >
          🔑 Đăng nhập
        </Link>
      </div>

      {/* Development Info - Mobile optimized */}
      <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
        <p className="mb-1">🚧 Dự án đang trong quá trình phát triển</p>
        <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
          <p>
            Backend:{' '}
            <span className="font-mono text-primary text-xs">
              localhost:8080
            </span>
          </p>
          <p>
            Frontend:{' '}
            <span className="font-mono text-primary text-xs">
              localhost:5173
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized Feature Card
function FeatureCard({ icon, title, description }) {
  return (
    <div className="group p-4 sm:p-6 border rounded-lg bg-card text-card-foreground hover:shadow-lg hover:border-primary/20 transition-all duration-200 touch-manipulation">
      <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default App;
