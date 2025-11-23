import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PictureOutlined,
  MessageOutlined,
  UserOutlined,
  CloseOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: <DashboardOutlined />, label: t('admin.sidebar.dashboard') },
    { path: '/admin/bookings', icon: <CalendarOutlined />, label: t('admin.sidebar.bookings') },
    { path: '/admin/tests', icon: <ExperimentOutlined />, label: t('admin.sidebar.tests') },
    { path: '/admin/notes', icon: <FileTextOutlined />, label: t('admin.sidebar.notes') },
    { path: '/admin/gallery', icon: <PictureOutlined />, label: t('admin.sidebar.gallery') },
    { path: '/admin/testimonials', icon: <MessageOutlined />, label: t('admin.sidebar.testimonials') },
    { path: '/admin/doctors', icon: <MedicineBoxOutlined />, label: t('admin.sidebar.doctors') },
    { path: '/admin/users', icon: <UserOutlined />, label: t('admin.sidebar.users') },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen fixed left-0 top-16 z-50 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CloseOutlined className="text-lg" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => {
                    // Close mobile menu on navigation
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    location.pathname === item.path
                      ? 'bg-french-rose-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;

