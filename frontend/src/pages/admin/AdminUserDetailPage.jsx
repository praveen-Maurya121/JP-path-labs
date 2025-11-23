import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Spin, Button, Avatar } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [userRes, bookingsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/bookings`),
      ]);
      setUser(userRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookingColumns = [
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Tests',
      dataIndex: 'tests',
      key: 'tests',
      render: (tests) => `${tests.length} test(s)`,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `₹${price}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          confirmed: 'blue',
          completed: 'green',
          cancelled: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="User Details">
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="User Details">
        <Card>User not found</Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Details">
      <div className="space-y-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/users')}
          className="mb-4"
        >
          Back to Users
        </Button>

        {/* User Info */}
        <Card className="bg-surface shadow-soft">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
            <Avatar
              size={{ xs: 80, sm: 100, md: 120 }}
              src={user.profilePicture}
              icon={<UserOutlined />}
              className="border-4 border-french-rose-200"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-surface mb-2">{user.name}</h2>
              <Tag color={user.role === 'admin' ? 'red' : 'blue'} className="mb-2">
                {user.role.toUpperCase()}
              </Tag>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-surface">Contact Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {user.phone || 'Not provided'}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {user.address || 'Not provided'}
                </p>
                <p>
                  <span className="font-medium">Joined:</span>{' '}
                  {dayjs(user.createdAt).format('DD MMM YYYY')}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-surface">Additional Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Bio:</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.bio || 'No bio provided'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-surface">Booking Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-french-rose-500">{bookings.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-orange-500">
                  {bookings.filter((b) => b.status === 'pending').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-blue-500">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-green-500">
                  {bookings.filter((b) => b.status === 'completed').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking History */}
        <Card className="bg-surface shadow-soft">
          <h3 className="text-lg font-semibold mb-4 text-surface">Booking History</h3>
          <Table
            dataSource={bookings}
            columns={bookingColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetailPage;

