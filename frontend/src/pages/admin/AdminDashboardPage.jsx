import { useState, useEffect } from 'react';
import { Card, Statistic, Table, Tag, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    revenue: 0,
    completionRate: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, bookingsRes] = await Promise.all([
        api.get('/users'),
        api.get('/bookings'),
      ]);

      const users = usersRes.data;
      const bookings = bookingsRes.data;

      const completed = bookings.filter((b) => b.status === 'completed');
      const revenue = completed.reduce((sum, b) => sum + b.totalPrice, 0);
      const completionRate =
        bookings.length > 0
          ? ((completed.length / bookings.length) * 100).toFixed(1)
          : 0;

      setStats({
        totalUsers: users.length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === 'pending').length,
        completedBookings: completed.length,
        cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
        revenue,
        completionRate,
      });

      // Sort bookings: pending first, then by date
      const sorted = [...bookings].sort((a, b) => {
        const statusOrder = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(b.appointmentDate) - new Date(a.appointmentDate);
      });

      setRecentBookings(sorted.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookingColumns = [
    {
      title: t('common.date'),
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: t('admin.bookings.patient'),
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: t('admin.bookings.user'),
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.email || 'N/A',
    },
    {
      title: t('admin.bookings.tests'),
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

  if (loading) {
    return (
      <AdminLayout title={t('admin.dashboard.title')}>
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.dashboard.title')} description={t('admin.dashboard.description')}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('admin.dashboard.totalUsers')}
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#e65286' }}
            />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('admin.dashboard.totalBookings')}
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#e65286' }}
            />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('admin.dashboard.totalRevenue')}
              value={stats.revenue}
              prefix={<DollarOutlined />}
              suffix="₹"
              valueStyle={{ color: '#e65286' }}
            />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('admin.dashboard.completionRate')}
              value={stats.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#e65286' }}
            />
          </Card>
        </div>

        {/* Booking Status Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('profile.bookingStatus.pending')}
              value={stats.pendingBookings}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('profile.bookingStatus.completed')}
              value={stats.completedBookings}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('profile.bookingStatus.cancelled')}
              value={stats.cancelledBookings}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="bg-surface shadow-soft">
          <h2 className="text-xl font-semibold mb-4 text-surface">{t('admin.dashboard.recentBookings')}</h2>
          <div className="overflow-x-auto">
            <Table
              dataSource={recentBookings}
              columns={bookingColumns}
              rowKey="_id"
              pagination={false}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

