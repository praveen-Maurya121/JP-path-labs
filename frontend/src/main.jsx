import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n/config';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#e65286',
                fontFamily: 'Poppins, sans-serif',
              },
            }}
          >
            <AntApp>
              <AuthProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </AuthProvider>
            </AntApp>
          </ConfigProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

