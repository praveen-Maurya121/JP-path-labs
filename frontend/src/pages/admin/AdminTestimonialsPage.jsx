import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, Rate, Tag, Statistic, Space, App, Select, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const { Search } = Input;
const { TextArea } = Input;

const AdminTestimonialsPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, search, activeOnly, statusFilter]);

  const fetchTestimonials = async () => {
    try {
      const response = await api.get('/testimonials/admin');
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeOnly) {
      filtered = filtered.filter((t) => t.isActive);
    }
    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    setFilteredTestimonials(filtered);
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/testimonials/${id}/approve`);
      message.success('Testimonial approved successfully');
      fetchTestimonials();
    } catch (error) {
      message.error('Failed to approve testimonial');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/testimonials/${id}/reject`);
      message.success('Testimonial rejected');
      fetchTestimonials();
    } catch (error) {
      message.error('Failed to reject testimonial');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTestimonial) {
        await api.put(`/testimonials/${editingTestimonial._id}`, values);
        message.success('Testimonial updated successfully');
      } else {
        await api.post('/testimonials', values);
        message.success('Testimonial created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    form.setFieldsValue(testimonial);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/testimonials/${id}`);
      message.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      message.error('Failed to delete testimonial');
    }
  };

  const stats = {
    total: testimonials.length,
    active: testimonials.filter((t) => t.isActive).length,
    pending: testimonials.filter((t) => t.status === 'pending').length,
    approved: testimonials.filter((t) => t.status === 'approved').length,
    rejected: testimonials.filter((t) => t.status === 'rejected').length,
    averageRating:
      testimonials.length > 0
        ? (
            testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
          ).toFixed(1)
        : 0,
  };

  const columns = [
    {
      title: t('admin.testimonials.avatar'),
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      render: (url, record) =>
        url ? (
          <img src={url} alt={record.name} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-french-rose-200 dark:bg-french-rose-800 flex items-center justify-center">
            <span className="text-french-rose-600 dark:text-french-rose-300 font-semibold">
              {record.name.charAt(0)}
            </span>
          </div>
        ),
    },
    {
      title: t('admin.testimonials.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('admin.testimonials.message'),
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: t('profile.rating'),
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <div>
          <Rate disabled value={rating} className="text-sm" />
          <span className="ml-2">{rating}/5</span>
        </div>
      ),
    },
    {
      title: t('profile.location'),
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const statusColors = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red'
        };
        const statusMap = {
          pending: t('admin.testimonials.pending'),
          approved: t('admin.testimonials.approved'),
          rejected: t('admin.testimonials.rejected'),
        };
        return (
          <div>
            <Tag color={statusColors[status]}>{statusMap[status]?.toUpperCase() || status.toUpperCase()}</Tag>
            {record.isActive && <Tag color="blue" className="ml-1">{t('admin.tests.active')}</Tag>}
          </div>
        );
      },
    },
    {
      title: t('admin.testimonials.source'),
      key: 'source',
      render: (_, record) => (
        record.user ? (
          <Tag color="blue">{t('admin.testimonials.userSubmitted')}</Tag>
        ) : (
          <Tag>{t('admin.testimonials.adminCreated')}</Tag>
        )
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record._id)}
                className="text-green-600"
              >
                {t('admin.testimonials.approve')}
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record._id)}
                className="text-red-600"
              >
                {t('admin.testimonials.reject')}
              </Button>
            </>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout
      title={t('admin.sidebar.testimonials')}
      description={t('admin.testimonials.description')}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          <Card className="bg-surface shadow-soft">
            <Statistic title={t('common.total')} value={stats.total} valueStyle={{ color: '#e65286' }} />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Badge count={stats.pending} offset={[10, 0]}>
              <Statistic title={t('admin.testimonials.pending')} value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
            </Badge>
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic title={t('admin.testimonials.approved')} value={stats.approved} valueStyle={{ color: '#52c41a' }} />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic title={t('admin.testimonials.rejected')} value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
          <Card className="bg-surface shadow-soft">
            <Statistic
              title={t('admin.testimonials.avgRating')}
              value={stats.averageRating}
              suffix="/5"
              valueStyle={{ color: '#e65286' }}
            />
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-surface shadow-soft">
          <div className="flex justify-between items-center">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Search
                placeholder={t('admin.testimonials.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                className="w-full sm:w-auto"
                style={{ maxWidth: 300 }}
              />
              <Select
                placeholder={t('admin.testimonials.filterByStatus')}
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Select.Option value="pending">{t('admin.testimonials.pending')}</Select.Option>
                <Select.Option value="approved">{t('admin.testimonials.approved')}</Select.Option>
                <Select.Option value="rejected">{t('admin.testimonials.rejected')}</Select.Option>
              </Select>
              <Switch
                checked={activeOnly}
                onChange={setActiveOnly}
                checkedChildren={t('admin.testimonials.activeOnly')}
                unCheckedChildren={t('admin.testimonials.all')}
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTestimonial(null);
                form.resetFields();
                setModalVisible(true);
              }}
              className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
            >
              {t('admin.testimonials.addTestimonial')}
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <Table
              dataSource={filteredTestimonials}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>

        {/* Modal */}
        <Modal
          title={editingTestimonial ? t('admin.testimonials.editTestimonial') : t('admin.testimonials.addTestimonial')}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingTestimonial(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 600 }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label={t('admin.testimonials.name')}
              rules={[{ required: true, message: t('admin.testimonials.nameRequired') }]}
            >
              <Input placeholder={t('admin.testimonials.namePlaceholder')} />
            </Form.Item>
            <Form.Item
              name="message"
              label={t('admin.testimonials.message')}
              rules={[{ required: true, message: t('admin.testimonials.messageRequired') }]}
            >
              <TextArea rows={4} placeholder={t('admin.testimonials.messagePlaceholder')} />
            </Form.Item>
            <Form.Item
              name="rating"
              label={t('profile.rating')}
              rules={[{ required: true, message: t('profile.ratingRequired') }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item name="location" label={t('profile.location')}>
              <Input placeholder={t('profile.locationPlaceholder')} />
            </Form.Item>
            <Form.Item name="avatarUrl" label={t('admin.testimonials.avatarUrl')}>
              <Input placeholder={t('admin.testimonials.avatarUrlPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="isActive"
              label={t('common.status')}
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren={t('admin.tests.active')} unCheckedChildren={t('admin.tests.inactive')} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
              >
                {editingTestimonial ? t('common.update') : t('common.create')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonialsPage;

