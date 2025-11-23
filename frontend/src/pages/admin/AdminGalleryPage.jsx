import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Upload, Switch, Tag, Space, Image, App, Radio, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, StarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const { TextArea } = Input;
const { Dragger } = Upload;

const AdminGalleryPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await api.get('/gallery');
      setGallery(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async ({ fileList }) => {
    if (fileList.length === 0) {
      form.setFieldsValue({ images: [] });
      return;
    }
    const images = await Promise.all(
      fileList.map(async (file) => {
        if (file.originFileObj) {
          return await getBase64(file.originFileObj);
        }
        return file.url || file.thumbUrl;
      })
    );
    // Store both fileList for display and images for submission
    form.setFieldsValue({ images, fileList });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = async (values) => {
    try {
      const { fileList, images, heroImageIndex, ...rest } = values;
      
      // Convert fileList to images if needed
      let imageData = images;
      if (!imageData && fileList && fileList.length > 0) {
        imageData = await Promise.all(
          fileList.map(async (file) => {
            if (file.originFileObj) {
              return await getBase64(file.originFileObj);
            }
            return file.url || file.thumbUrl || file.response?.url;
          })
        );
      }
      
      if (editingItem) {
        // For editing, update single item
        const updateData = { ...rest, imageUrl: imageData?.[0] || rest.imageUrl };
        if (heroImageIndex !== undefined) {
          updateData.isHero = heroImageIndex === 0;
        }
        await api.put(`/gallery/${editingItem._id}`, updateData);
        message.success('Gallery item updated successfully');
      } else {
        // For new items, handle multiple images
        const isHero = heroImageIndex !== undefined && heroImageIndex === 0;
        
        if (imageData && imageData.length > 0) {
          await api.post('/gallery', { ...rest, images: imageData, isHero });
        } else if (rest.imageUrl) {
          await api.post('/gallery', { ...rest, imageUrl: rest.imageUrl, isHero });
        } else {
          message.error('Please upload at least one image or provide an image URL');
          return;
        }
        message.success('Gallery item(s) created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      fetchGallery();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Operation failed';
      if (error.response?.status === 403) {
        message.error('Access denied. Please ensure you are logged in as an admin.');
      } else {
        message.error(errorMsg);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({ 
      ...item, 
      images: item.imageUrl ? [item.imageUrl] : [],
      heroImageIndex: item.isHero ? 0 : undefined
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/gallery/${id}`);
      message.success('Gallery item deleted successfully');
      fetchGallery();
    } catch (error) {
      message.error('Failed to delete gallery item');
    }
  };

  const columns = [
    {
      title: t('admin.gallery.thumbnail'),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url) => (
        <Image
          src={url}
          alt="Gallery"
          width={80}
          height={80}
          className="object-cover rounded"
        />
      ),
    },
    {
      title: t('admin.gallery.title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('admin.gallery.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('admin.gallery.hero'),
      dataIndex: 'isHero',
      key: 'isHero',
      render: (isHero) => (
        isHero ? (
          <Tag color="gold" icon={<StarOutlined />}>{t('admin.gallery.heroImage')}</Tag>
        ) : (
          <Tag>{t('admin.gallery.gallery')}</Tag>
        )
      ),
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
      title: t('admin.gallery.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
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
    <AdminLayout title={t('admin.sidebar.gallery')} description={t('admin.gallery.description')}>
      <div className="space-y-6">
        <Card className="bg-surface shadow-soft">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setModalVisible(true);
            }}
            className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
          >
            {t('admin.gallery.addGalleryItem')}
          </Button>
        </Card>

        <Card className="bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <Table
              dataSource={gallery}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>

        <Modal
          title={editingItem ? t('admin.gallery.editGalleryItem') : t('admin.gallery.addGalleryItem')}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingItem(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 700 }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="title"
              label={t('admin.gallery.title')}
              rules={[{ required: true, message: t('admin.gallery.titleRequired') }]}
            >
              <Input placeholder={t('admin.gallery.titlePlaceholder')} />
            </Form.Item>
            <Form.Item
              name="description"
              label={t('admin.gallery.description')}
            >
              <TextArea rows={3} placeholder={t('admin.gallery.descriptionPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="fileList"
              label={t('admin.gallery.images')}
              rules={[{ required: !editingItem, message: t('admin.gallery.imageRequired') }]}
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Dragger
                multiple
                beforeUpload={() => false}
                onChange={handleUpload}
                accept="image/*"
                listType="picture"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">{t('admin.gallery.uploadText')}</p>
                <p className="ant-upload-hint">{t('admin.gallery.uploadHint')}</p>
              </Dragger>
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.fileList?.length !== currentValues.fileList?.length ||
                prevValues.images?.length !== currentValues.images?.length
              }
            >
              {({ getFieldValue }) => {
                const fileList = getFieldValue('fileList') || [];
                const images = getFieldValue('images') || [];
                const imageCount = fileList.length || images.length;
                
                if (imageCount > 0 && !editingItem) {
                  return (
                    <Form.Item
                      name="heroImageIndex"
                      label={t('admin.gallery.selectHeroImage')}
                      tooltip={t('admin.gallery.heroImageTooltip')}
                      initialValue={0}
                    >
                      <Radio.Group>
                        {Array.from({ length: imageCount }).map((_, index) => (
                          <Radio key={index} value={index}>
                            {t('admin.gallery.image')} {index + 1} {index === 0 && <Tag color="gold" className="ml-2">{t('admin.gallery.recommended')}</Tag>}
                          </Radio>
                        ))}
                        <Radio value={-1}>{t('admin.gallery.noneGalleryOnly')}</Radio>
                      </Radio.Group>
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
            
            {editingItem && (
              <Form.Item
                name="isHero"
                label={t('admin.gallery.setAsHeroImage')}
                tooltip={t('admin.gallery.heroImageTooltip')}
                valuePropName="checked"
              >
                <Switch checkedChildren={t('admin.gallery.hero')} unCheckedChildren={t('admin.gallery.gallery')} />
              </Form.Item>
            )}
            
            <Form.Item
              name="imageUrl"
              label={t('admin.gallery.imageUrl')}
            >
              <Input placeholder={t('admin.gallery.imageUrlPlaceholder')} />
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
                {editingItem ? t('common.update') : t('common.create')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminGalleryPage;

