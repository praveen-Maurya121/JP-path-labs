import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Upload, Space, Tag, App, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const { Search } = Input;
const { TextArea } = Input;

const AdminDoctorsPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, search]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors/admin');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];
    if (search) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(search.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(search.toLowerCase()) ||
          doctor.review.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredDoctors(filtered);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        imageUrl: values.imageUrl || (values.imageFile?.[0]?.response?.url || values.imageFile?.[0]?.thumbUrl),
      };
      delete formData.imageFile;

      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor._id}`, formData);
        message.success(t('messages.doctorUpdated'));
      } else {
        await api.post('/doctors', formData);
        message.success(t('messages.doctorAdded'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingDoctor(null);
      fetchDoctors();
    } catch (error) {
      message.error(error.response?.data?.message || t('messages.doctorSaveFailed'));
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    form.setFieldsValue({
      ...doctor,
      imageFile: doctor.imageUrl ? [{ uid: '-1', name: 'image', status: 'done', url: doctor.imageUrl }] : [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/doctors/${id}`);
      message.success(t('messages.doctorDeleted'));
      fetchDoctors();
    } catch (error) {
      message.error(t('messages.doctorDeleteFailed'));
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setFieldsValue({
        imageUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const stats = {
    total: doctors.length,
    active: doctors.filter((d) => d.isActive).length,
    inactive: doctors.filter((d) => !d.isActive).length,
  };

  const columns = [
    {
      title: t('admin.doctors.image'),
      key: 'image',
      width: 100,
      render: (_, record) => (
        <img
          src={record.imageUrl}
          alt={record.name}
          className="w-16 h-16 object-cover rounded-full"
        />
      ),
    },
    {
      title: t('admin.doctors.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('admin.doctors.specialization'),
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: t('admin.doctors.review'),
      dataIndex: 'review',
      key: 'review',
      ellipsis: true,
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: t('profile.rating'),
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Tag color="gold">{rating} ⭐</Tag>,
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('admin.tests.active') : t('admin.tests.inactive')}
        </Tag>
      ),
    },
    {
      title: t('admin.doctors.order'),
      dataIndex: 'order',
      key: 'order',
      render: (order) => <span>{order || 0}</span>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
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
      title={t('admin.sidebar.doctors')}
      description={t('admin.doctors.description')}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-surface shadow-soft">
            <div className="text-2xl font-bold text-french-rose-500">{stats.total}</div>
            <div className="text-gray-600 dark:text-gray-400">{t('admin.doctors.totalDoctors')}</div>
          </Card>
          <Card className="bg-surface shadow-soft">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <div className="text-gray-600 dark:text-gray-400">{t('admin.doctors.activeDoctors')}</div>
          </Card>
          <Card className="bg-surface shadow-soft">
            <div className="text-2xl font-bold text-red-500">{stats.inactive}</div>
            <div className="text-gray-600 dark:text-gray-400">{t('admin.doctors.inactiveDoctors')}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-surface shadow-soft">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
            <Search
              placeholder={t('admin.doctors.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="w-full sm:w-auto"
              style={{ maxWidth: 400 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingDoctor(null);
                form.resetFields();
                setModalVisible(true);
              }}
              className="bg-french-rose-500 hover:bg-french-rose-600 border-none w-full sm:w-auto"
            >
              {t('admin.doctors.addDoctorReview')}
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <Table
              dataSource={filteredDoctors}
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
          title={editingDoctor ? t('admin.doctors.editDoctorReview') : t('admin.doctors.addDoctorReview')}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingDoctor(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 700 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              rating: 5,
              isActive: true,
              order: 0,
            }}
          >
            <Form.Item
              name="name"
              label={t('admin.doctors.doctorName')}
              rules={[{ required: true, message: t('admin.doctors.doctorNameRequired') }]}
            >
              <Input placeholder={t('admin.doctors.doctorNamePlaceholder')} />
            </Form.Item>

            <Form.Item
              name="specialization"
              label={t('admin.doctors.specialization')}
              rules={[{ required: true, message: t('admin.doctors.specializationRequired') }]}
            >
              <Input placeholder={t('admin.doctors.specializationPlaceholder')} />
            </Form.Item>

            <Form.Item
              name="imageFile"
              label={t('admin.doctors.doctorImage')}
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList;
              }}
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={handleImageUpload}
                accept="image/*"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>{t('common.upload')}</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label={t('admin.doctors.imageUrl')}
            >
              <Input placeholder={t('admin.doctors.imageUrlPlaceholder')} />
            </Form.Item>

            <Form.Item
              name="review"
              label={t('admin.doctors.review')}
              rules={[{ required: true, message: t('admin.doctors.reviewRequired') }]}
            >
              <TextArea
                rows={4}
                placeholder={t('admin.doctors.reviewPlaceholder')}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="rating"
              label={t('profile.rating')}
              rules={[{ required: true, message: t('profile.ratingRequired') }]}
            >
              <InputNumber min={1} max={5} placeholder={t('admin.doctors.ratingPlaceholder')} />
            </Form.Item>

            <Form.Item
              name="order"
              label={t('admin.doctors.displayOrder')}
              tooltip={t('admin.doctors.displayOrderTooltip')}
            >
              <InputNumber min={0} placeholder={t('admin.doctors.orderPlaceholder')} />
            </Form.Item>

            <Form.Item
              name="isActive"
              label={t('common.status')}
              valuePropName="checked"
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
                {editingDoctor ? t('admin.doctors.updateDoctor') : t('admin.doctors.addDoctor')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminDoctorsPage;

