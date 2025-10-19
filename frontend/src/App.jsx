import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// TODO: Import pages when created
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import MapPage from './pages/MapPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        {/* TODO: Add Header/Navigation component */}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Temporary welcome page */}
            <Route path="/" element={<WelcomePage />} />
            
            {/* TODO: Add actual routes */}
            {/* <Route path="/login" element={<LoginPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/dashboard" element={<DashboardPage />} /> */}
          </Routes>
        </main>

        {/* Toast notifications */}
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

// Temporary welcome component
function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">
        🔋 ChargeEVDN
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Hệ thống quản lý và đặt chỗ trạm sạc xe điện
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
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

      <div className="mt-8 text-sm text-muted-foreground">
        <p>🚧 Dự án đang trong quá trình phát triển</p>
        <p>Backend: <span className="font-mono">http://localhost:8080</span></p>
        <p>Frontend: <span className="font-mono">http://localhost:5173</span></p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 border rounded-lg bg-card text-card-foreground hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default App;