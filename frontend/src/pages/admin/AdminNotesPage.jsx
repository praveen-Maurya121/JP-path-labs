import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const { Search } = Input;
const { TextArea } = Input;

const AdminNotesPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, search]);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];
    if (search) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredNotes(filtered);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, values);
        message.success(t('messages.noteUpdated'));
      } else {
        await api.post('/notes', values);
        message.success(t('messages.noteCreated'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      message.error(t('messages.operationFailed'));
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    form.setFieldsValue(note);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      message.success(t('messages.noteDeleted'));
      fetchNotes();
    } catch (error) {
      message.error(t('messages.noteDeleteFailed'));
    }
  };

  const columns = [
    {
      title: t('admin.notes.title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('admin.notes.content'),
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text) => text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    },
    {
      title: t('admin.notes.lastUpdated'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
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
    <AdminLayout title={t('admin.sidebar.notes')} description={t('admin.notes.description')}>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="bg-surface shadow-soft">
          <div className="flex justify-between items-center">
            <Search
              placeholder={t('admin.notes.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingNote(null);
                form.resetFields();
                setModalVisible(true);
              }}
              className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
            >
              {t('admin.notes.addNote')}
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <Table
              dataSource={filteredNotes}
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
          title={editingNote ? t('admin.notes.editNote') : t('admin.notes.addNote')}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingNote(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 600 }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="title"
              label={t('admin.notes.title')}
              rules={[{ required: true, message: t('admin.notes.titleRequired') }]}
            >
              <Input placeholder={t('admin.notes.titlePlaceholder')} />
            </Form.Item>
            <Form.Item
              name="content"
              label={t('admin.notes.content')}
              rules={[{ required: true, message: t('admin.notes.contentRequired') }]}
            >
              <TextArea rows={6} placeholder={t('admin.notes.contentPlaceholder')} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
              >
                {editingNote ? t('common.update') : t('common.create')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminNotesPage;

