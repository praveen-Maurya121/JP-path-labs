import { useState, useEffect } from 'react';
import { Card, Button, InputNumber, Table, Modal, Form, DatePicker, Input, Tag, Empty, message } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import api from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const CartPage = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/me');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBooking = async (values) => {
    try {
      setLoading(true);
      const bookingData = {
        tests: items.map((item) => ({
          test: item.test._id,
          quantity: item.quantity,
        })),
        appointmentDate: values.appointmentDate.toISOString(),
        patientName: values.patientName,
        patientPhone: values.patientPhone,
        address: values.address,
        notes: values.notes || '',
      };

      await api.post('/bookings', bookingData);
      message.success(t('messages.bookingSuccessful'));
      clearCart();
      setBookingModalVisible(false);
      form.resetFields();
      fetchBookings();
    } catch (error) {
      message.error(error.response?.data?.message || t('messages.bookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const cartColumns = [
    {
      title: t('cart.test'),
      dataIndex: 'test',
      key: 'test',
      render: (test) => test.name,
    },
    {
      title: t('tests.category'),
      dataIndex: 'test',
      key: 'category',
      render: (test) => <Tag>{test.category}</Tag>,
    },
    {
      title: t('cart.price'),
      dataIndex: 'test',
      key: 'price',
      render: (test) => `₹${test.price}`,
    },
    {
      title: t('cart.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateQuantity(record.test._id, value)}
        />
      ),
    },
    {
      title: t('common.total'),
      key: 'total',
      render: (_, record) => `₹${record.test.price * record.quantity}`,
    },
    {
      title: t('common.actions'),
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.test._id)}
        >
          {t('cart.remove')}
        </Button>
      ),
    },
  ];

  const bookingColumns = [
    {
      title: t('common.date'),
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: t('cart.patientName'),
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: t('navbar.tests'),
      dataIndex: 'tests',
      key: 'tests',
      render: (tests) => `${tests.length} ${t('tests.tests')}`,
    },
    {
      title: t('common.total'),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `₹${price}`,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          confirmed: 'blue',
          completed: 'green',
          cancelled: 'red',
        };
        const statusMap = {
          pending: t('profile.bookingStatus.pending'),
          confirmed: t('profile.bookingStatus.confirmed'),
          completed: t('profile.bookingStatus.completed'),
          cancelled: t('profile.bookingStatus.cancelled'),
        };
        return <Tag color={colors[status]}>{statusMap[status]?.toUpperCase() || status.toUpperCase()}</Tag>;
      },
    },
  ];

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center">
          <p className="text-lg mb-4">{t('cart.loginRequired')}</p>
          <Button type="primary" onClick={() => navigate('/login')}>
            {t('navbar.login')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-8">
        {t('cart.title')}
      </h1>

      {items.length > 0 ? (
        <>
          <Card className="bg-surface shadow-soft mb-4 sm:mb-6 md:mb-8">
            <div className="overflow-x-auto">
              <Table
                dataSource={items}
                columns={cartColumns}
                rowKey={(record) => record.test._id}
                pagination={false}
                scroll={{ x: 600 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <span className="text-base sm:text-lg font-semibold">{t('common.total')}:</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <span className="text-xl sm:text-2xl font-bold text-french-rose-500">
                          ₹{total}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<CalendarOutlined />}
                          onClick={() => setBookingModalVisible(true)}
                          className="bg-french-rose-500 hover:bg-french-rose-600 border-none text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">{t('cart.bookAppointment')}</span>
                          <span className="sm:hidden">{t('cart.book')}</span>
                        </Button>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          </Card>

          <Modal
            title={t('cart.bookAppointment')}
            open={bookingModalVisible}
            onCancel={() => {
              setBookingModalVisible(false);
              form.resetFields();
            }}
            footer={null}
            width="90%"
            style={{ maxWidth: 600 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleBooking}
              initialValues={{
                appointmentDate: dayjs().add(1, 'day'),
              }}
            >
              <Form.Item
                name="appointmentDate"
                label={t('cart.appointmentDate')}
                rules={[{ required: true, message: t('cart.appointmentDate') + ' ' + t('common.error') }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  className="w-full"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
              <Form.Item
                name="patientName"
                label={t('cart.patientName')}
                rules={[{ required: true, message: t('cart.patientName') + ' ' + t('common.error') }]}
              >
                <Input placeholder={t('cart.patientName')} />
              </Form.Item>
              <Form.Item
                name="patientPhone"
                label={t('cart.patientPhone')}
                rules={[
                  { required: true, message: t('cart.patientPhone') + ' ' + t('common.error') },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid phone number' },
                ]}
              >
                <Input placeholder={t('cart.patientPhone')} />
              </Form.Item>
              <Form.Item
                name="address"
                label={t('cart.address')}
                rules={[{ required: true, message: t('cart.address') + ' ' + t('common.error') }]}
              >
                <TextArea rows={3} placeholder={t('cart.address')} />
              </Form.Item>
              <Form.Item name="notes" label={t('cart.notes')}>
                <TextArea rows={3} placeholder={t('cart.notes')} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
                >
                  {t('cart.confirmBooking')}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </>
      ) : (
        <Card className="text-center">
          <Empty
            description={t('cart.empty')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/tests')}>
              {t('home.viewAll')}
            </Button>
          </Empty>
        </Card>
      )}

      {/* Booking History */}
      {bookings.length > 0 && (
        <div className="mt-8 sm:mt-10 md:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('profile.bookingHistory')}
          </h2>
          <Card className="bg-surface shadow-soft">
            <div className="overflow-x-auto">
              <Table
                dataSource={bookings}
                columns={bookingColumns}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 600 }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CartPage;

