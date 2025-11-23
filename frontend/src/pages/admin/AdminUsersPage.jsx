import { useState, useEffect } from 'react';
import { Card, Table, Button, Select, Input, Tag, Statistic, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

const { Search } = Input;
const { Option } = Select;

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          (u.phone && u.phone.includes(search)) ||
          (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id) {
      message.warning('Cannot change your own role');
      return;
    }
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      message.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser.id) {
      message.warning('Cannot delete yourself');
      return;
    }
    try {
      await api.delete(`/users/${userId}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    regular: users.filter((u) => u.role === 'user').length,
  };

  const columns = [
    {
      title: t('admin.users.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/admin/users/${record._id}`)}
          className="p-0"
        >
          {name}
        </Button>
      ),
    },
    {
      title: t('admin.bookings.phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('admin.bookings.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || <span className="text-gray-400">{t('admin.users.notProvided')}</span>,
    },
    {
      title: t('admin.users.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record._id, value)}
          disabled={record._id === currentUser?.id}
          style={{ width: 100 }}
        >
          <Option value="user">{t('admin.users.user')}</Option>
          <Option value="admin">{t('admin.users.admin')}</Option>
        </Select>
      ),
    },
    {
      title: t('admin.users.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
          disabled={record._id === currentUser?.id}
        >
          {t('common.delete')}
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title={t('admin.sidebar.users')} description={t('admin.users.description')}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-surface shadow-soft">
            <Statistic title={t('admin.users.totalUsers')} value={stats.total} valueStyle={{ color: '#e65286' }} />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic title={t('admin.users.admins')} value={stats.admins} valueStyle={{ color: '#e65286' }} />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic title={t('admin.users.regularUsers')} value={stats.regular} valueStyle={{ color: '#e65286' }} />
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-surface shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Search
              placeholder={t('admin.users.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            <Select
              placeholder={t('admin.users.filterByRole')}
              className="w-full"
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
            >
              <Option value="user">{t('admin.users.user')}</Option>
              <Option value="admin">{t('admin.users.admin')}</Option>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <Table
              dataSource={filteredUsers}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;

