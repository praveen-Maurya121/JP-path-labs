import { ExperimentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ExperimentOutlined className="text-2xl text-french-rose-400" />
              <span className="text-xl font-bold text-white">{t('navbar.appName')}</span>
            </div>
            <p className="text-gray-400">
            {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-french-rose-400 transition-colors">
                  {t('navbar.home')}
                </a>
              </li>
              <li>
                <a href="/tests" className="hover:text-french-rose-400 transition-colors">
                  {t('tests.title')}
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-french-rose-400 transition-colors">
                  {t('navbar.cart')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contactInfo')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <PhoneOutlined />
                <span>+91 93368 22645</span>
              </li>
              <li className="flex items-center space-x-2">
                <MailOutlined />
                <span>next.vidya@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <ClockCircleOutlined />
                <span>24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

