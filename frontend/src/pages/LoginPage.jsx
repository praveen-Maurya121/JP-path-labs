import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { PhoneOutlined, LockOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.phone, values.password);
    setLoading(false);

    if (result.success) {
      message.success(t('messages.loginSuccessful'));
      navigate('/');
    } else {
      message.error(result.message || t('messages.loginFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-french-rose-50 to-french-rose-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-french-rose-500 hover:text-french-rose-600 transition-colors">
            <ArrowLeftOutlined className="mr-2" />
            <span>{t('common.backToHome')}</span>
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('login.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('login.subtitle')}
          </p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: t('login.phone') + ' ' + t('common.error') },
              { pattern: /^\+?[0-9]{10,15}$/, message: 'Please enter a valid phone number (10-15 digits)!' },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder={t('login.phone')}
              maxLength={15}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('login.password') + ' ' + t('common.error') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('login.password')}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
            >
              {t('login.loginButton')}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-600 dark:text-gray-400">
            {t('login.noAccount')}{' '}
          </span>
          <Link to="/register" className="text-french-rose-500 hover:text-french-rose-600">
            {t('login.registerHere')}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

