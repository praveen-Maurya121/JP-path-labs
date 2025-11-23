import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Dropdown, Badge, Switch, Button } from 'antd';
import {
  HomeOutlined,
  ExperimentOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  MoonOutlined,
  SunOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, toggleLanguage } = useLanguage();

  // Hide navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common.profile'),
      onClick: () => navigate('/profile'),
    },
    ...(user?.role === 'admin'
      ? [
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: t('common.adminDashboard'),
            onClick: () => navigate('/admin'),
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: () => logout(),
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
            <ExperimentOutlined className="text-xl sm:text-2xl text-french-rose-500" />
            <span className="text-base sm:text-lg md:text-xl font-bold text-french-rose-600 dark:text-french-rose-400">
            {t('navbar.appName')}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-french-rose-600 dark:text-french-rose-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-french-rose-500'
              }`}
            >
              <HomeOutlined className="mr-1" />
              {t('navbar.home')}
            </Link>
            <Link
              to="/tests"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/tests'
                  ? 'text-french-rose-600 dark:text-french-rose-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-french-rose-500'
              }`}
            >
              <ExperimentOutlined className="mr-1" />
              {t('navbar.tests')}
            </Link>
            <Link
              to="/upload-prescription"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/upload-prescription'
                  ? 'text-french-rose-600 dark:text-french-rose-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-french-rose-500'
              }`}
            >
              <FileTextOutlined className="mr-1" />
              {t('navbar.uploadPrescription')}
            </Link>
            <Link
              to="/cart"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-french-rose-500 transition-colors relative"
            >
              <ShoppingCartOutlined className="mr-1" />
              {t('navbar.cart')}
              {items.length > 0 && (
                <Badge count={items.length} className="absolute -top-1 -right-1" />
              )}
            </Link>

            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              className="ml-2"
              title={currentLanguage === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              {currentLanguage === 'en' ? 'हिंदी' : 'English'}
            </Button>
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              className="ml-2"
            />

            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-french-rose-500 transition-colors">
                  <UserOutlined />
                  <span>{user.name}</span>
                </button>
              </Dropdown>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-french-rose-500 transition-colors"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-french-rose-500 text-white hover:bg-french-rose-600 transition-colors"
                >
                  {t('navbar.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative">
              <ShoppingCartOutlined className="text-xl text-gray-700 dark:text-gray-300" />
              {items.length > 0 && (
                <Badge count={items.length} className="absolute -top-1 -right-1" />
              )}
            </Link>
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              size="small"
              className="mr-2"
            >
              {currentLanguage === 'en' ? 'हिंदी' : 'EN'}
            </Button>
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <button>
                  <UserOutlined className="text-xl text-gray-700 dark:text-gray-300" />
                </button>
              </Dropdown>
            ) : (
              <Link to="/login" className="text-gray-700 dark:text-gray-300">
                {t('navbar.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

