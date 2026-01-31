import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import DemoBanner from './components/DemoBanner';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import LowStockPage from './pages/LowStockPage';
import SalesPage from './pages/SalesPage';
import ProfitPage from './pages/ProfitPage';
import UploadPage from './pages/UploadPage';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';

import { 
  LayoutDashboard, 
  Package, 
  TrendingDown, 
  ShoppingCart, 
  DollarSign, 
  Upload, 
  Download, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './components/ui/button';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Low Stock', path: '/low-stock', icon: TrendingDown },
    { name: 'Sales', path: '/sales', icon: ShoppingCart },
    { name: 'Profit', path: '/profit', icon: DollarSign },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Export', path: '/export', icon: Download },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen
        w-64 bg-card border-r
        transition-transform duration-300 ease-in-out z-50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold font-heading">FBASense</h1>
                  <p className="text-xs text-muted-foreground">Inventory Manager</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                      transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              data-testid="logout-button"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

const AppLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="text-foreground"
              data-testid="mobile-menu-button"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-bold font-heading">FBASense</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        <DemoBanner />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/low-stock" element={<LowStockPage />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/profit" element={<ProfitPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/export" element={<ExportPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
