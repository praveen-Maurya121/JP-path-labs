import { useState } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children, title, description }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 md:ml-64 p-4 sm:p-6 md:p-8 pt-16 sm:pt-20">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {description && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

