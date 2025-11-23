import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-french-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    message.warning('Please login to access admin panel');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    message.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

