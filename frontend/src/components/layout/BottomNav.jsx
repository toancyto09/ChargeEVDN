import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Map, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Home',
    },
    {
      path: '/bookings',
      icon: Calendar,
      label: 'Đặt chỗ',
    },
    {
      path: '/map',
      icon: Map,
      label: 'Bản đồ',
    },
    {
      path: '/sessions',
      icon: Zap,
      label: 'Phiên sạc',
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Cài đặt',
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    // Map is always accessible
    if (path === '/map') {
      navigate(path);
      return;
    }

    // Other pages require login
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này', {
        action: {
          label: 'Đăng nhập',
          onClick: () => navigate('/login'),
        },
        duration: 3000,
      });
      return;
    }

    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[1001]">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const requiresLogin = item.path !== '/map';

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                active ? 'text-green-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5]' : ''}`}
              />
              <span
                className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}
              >
                {item.label}
              </span>
              {/* Show lock icon for protected routes when not logged in */}
              {requiresLogin && !isLoggedIn && (
                <div className="absolute top-2 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
