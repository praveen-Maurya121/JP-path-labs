import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, Select, Tag, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

const AdminTestsPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, search, categoryFilter, activeOnly]);

  const fetchTests = async () => {
    try {
      // Fetch all tests for admin (no pagination limit)
      const response = await api.get('/tests?limit=10000&activeOnly=false');
      // Handle both paginated and non-paginated responses
      const testsData = response.data?.tests || response.data || [];
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    if (search) {
      filtered = filtered.filter(
        (test) =>
          test.name.toLowerCase().includes(search.toLowerCase()) ||
          test.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((test) => test.category === categoryFilter);
    }

    if (activeOnly) {
      filtered = filtered.filter((test) => test.isActive);
    }

    setFilteredTests(filtered);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTest) {
        await api.put(`/tests/${editingTest._id}`, values);
        message.success(t('messages.testUpdated'));
      } else {
        await api.post('/tests', values);
        message.success(t('messages.testCreated'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTest(null);
      fetchTests();
    } catch (error) {
      message.error(error.response?.data?.message || t('messages.operationFailed'));
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    form.setFieldsValue(test);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tests/${id}`);
      message.success(t('messages.testDeleted'));
      fetchTests();
    } catch (error) {
      message.error(t('messages.testDeleteFailed'));
    }
  };

  const categories = [...new Set(tests.map((test) => test.category))];

  const stats = {
    total: tests.length,
    active: tests.filter((t) => t.isActive).length,
    inactive: tests.filter((t) => !t.isActive).length,
  };

  const columns = [
    {
      title: t('admin.tests.testName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('tests.category'),
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: t('testCard.sample'),
      dataIndex: 'sampleType',
      key: 'sampleType',
    },
    {
      title: t('cart.price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price}`,
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? t('admin.tests.active') : t('admin.tests.inactive')}</Tag>
      ),
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
    <AdminLayout title={t('admin.tests.title')} description={t('admin.tests.description')}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-surface shadow-soft">
            <div className="text-2xl font-bold text-french-rose-500">{stats.total}</div>
            <div className="text-gray-600 dark:text-gray-400">{t('admin.tests.totalTests')}</div>
          </Card>
          <Card className="bg-surface shadow-soft">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <div className="text-gray-600 dark:text-gray-400">{t('admin.tests.activeTests')}</div>
          </Card>
          <Card className="bg-surface shadow-soft">
            <div className="text-2xl font-bold text-red-500">{stats.inactive}</div>
            <div className="text-gray-600 dark:text-gray-400">{t('admin.tests.inactiveTests')}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-surface shadow-soft">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <Search
                placeholder={t('tests.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
              <Select
                placeholder={t('admin.tests.filterByCategory')}
                className="w-full"
                value={categoryFilter}
                onChange={setCategoryFilter}
                allowClear
              >
                {categories.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
              <Switch
                checked={activeOnly}
                onChange={setActiveOnly}
                checkedChildren={t('tests.activeOnly')}
                unCheckedChildren={t('tests.allTests')}
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTest(null);
                form.resetFields();
                setModalVisible(true);
              }}
              className="sm:ml-4 bg-french-rose-500 hover:bg-french-rose-600 border-none w-full sm:w-auto"
            >
              {t('admin.tests.addTest')}
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <Table
              dataSource={filteredTests}
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
          title={editingTest ? t('admin.tests.editTest') : t('admin.tests.addTest')}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingTest(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 600 }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label={t('admin.tests.testName')}
              rules={[{ required: true, message: t('admin.tests.testNameRequired') }]}
            >
              <Input placeholder={t('admin.tests.testName')} />
            </Form.Item>
            <Form.Item
              name="description"
              label={t('admin.tests.description')}
            >
              <TextArea rows={3} placeholder={t('admin.tests.descriptionPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="category"
              label={t('tests.category')}
              rules={[{ required: true, message: t('admin.tests.categoryRequired') }]}
            >
              <Input placeholder={t('tests.category')} />
            </Form.Item>
            <Form.Item
              name="price"
              label={t('admin.tests.price')}
              rules={[{ required: true, message: t('admin.tests.priceRequired') }]}
            >
              <InputNumber
                min={0}
                className="w-full"
                placeholder={t('admin.tests.pricePlaceholder')}
                formatter={(value) => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                parser={(value) => value ? value.replace(/₹\s?|(,*)/g, '') : ''}
              />
            </Form.Item>
            <Form.Item
              name="sampleType"
              label={t('testCard.sample')}
              rules={[{ required: true, message: t('admin.tests.sampleTypeRequired') }]}
            >
              <Input placeholder={t('admin.tests.sampleTypePlaceholder')} />
            </Form.Item>
            <Form.Item
              name="preparation"
              label={t('testCard.prep')}
            >
              <TextArea rows={2} placeholder={t('admin.tests.preparationPlaceholder')} />
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
                {editingTest ? t('common.update') : t('common.create')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminTestsPage;

