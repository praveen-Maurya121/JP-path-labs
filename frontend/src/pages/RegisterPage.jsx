import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error(t('register.password') + ' ' + t('common.error'));
      return;
    }

    setLoading(true);
    const result = await register(values.name, values.phone, values.password, values.email || '');
    setLoading(false);

    if (result.success) {
      message.success(t('messages.registrationSuccessful'));
      navigate('/');
    } else {
      message.error(result.message || t('messages.registrationFailed'));
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
            {t('register.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('register.subtitle')}
          </p>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: t('register.name') + ' ' + t('common.error') }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('register.name')}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: t('register.phone') + ' ' + t('common.error') },
              { pattern: /^\+?[0-9]{10,15}$/, message: 'Please enter a valid phone number (10-15 digits)!' },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder={t('register.phone')}
              maxLength={15}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('register.email')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('register.password') + ' ' + t('common.error') },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('register.password')}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: t('register.confirmPassword') + ' ' + t('common.error') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('register.confirmPassword')}
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
              {t('register.registerButton')}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-600 dark:text-gray-400">
            {t('register.hasAccount')}{' '}
          </span>
          <Link to="/login" className="text-french-rose-500 hover:text-french-rose-600">
            {t('register.loginHere')}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;

