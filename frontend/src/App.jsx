import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';

// Public pages
import HomePage from './pages/HomePage';
import TestCatalogPage from './pages/TestCatalogPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import UploadTestPrescriptionPage from './pages/UploadTestPrescriptionPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminTestsPage from './pages/admin/AdminTestsPage';
import AdminNotesPage from './pages/admin/AdminNotesPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';

function App() {
  const { loading } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-french-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tests" element={<TestCatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-prescription"
            element={
              <ProtectedRoute>
                <UploadTestPrescriptionPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminBookingsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tests"
            element={
              <AdminRoute>
                <AdminTestsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notes"
            element={
              <AdminRoute>
                <AdminNotesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <AdminRoute>
                <AdminGalleryPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/testimonials"
            element={
              <AdminRoute>
                <AdminTestimonialsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <AdminRoute>
                <AdminDoctorsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <AdminRoute>
                <AdminUserDetailPage />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminPage && !isAuthPage && <Footer />}
    </div>
  );
}

export default App;

