import { useState, useEffect } from 'react';
import { Card, Upload, Button, Form, Input, App, Spin, Empty, Image, Tag } from 'antd';
import { UploadOutlined, FileImageOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { TextArea } = Input;

const UploadTestPrescriptionPage = () => {
  const { t } = useTranslation();
  const { message: messageApi } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingImage, setViewingImage] = useState('');
  const { user } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions/me');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setFetching(false);
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

  const handleUpload = async ({ file }) => {
    if (file) {
      const base64 = await getBase64(file.originFileObj || file);
      form.setFieldsValue({ imageUrl: base64 });
    }
  };

  const handleSubmit = async (values) => {
    if (!values.imageUrl && fileList.length === 0) {
      messageApi.error(t('prescription.imageRequired'));
      return;
    }

    setLoading(true);
    try {
      let imageUrl = values.imageUrl;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageUrl = await getBase64(fileList[0].originFileObj);
      }

      await api.post('/prescriptions', {
        imageUrl,
        notes: values.notes || ''
      });

      messageApi.success(t('prescription.uploadSuccessful'));
      form.resetFields();
      setFileList([]);
      fetchPrescriptions();
    } catch (error) {
      messageApi.error(error.response?.data?.message || t('prescription.uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
    if (!isJpgOrPng) {
      messageApi.error(t('prescription.invalidFileType'));
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      messageApi.error(t('prescription.fileSizeError'));
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length === 0) {
      form.setFieldsValue({ imageUrl: '' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      reviewed: 'blue',
      booked: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const handleView = (imageUrl) => {
    setViewingImage(imageUrl);
    setViewModalVisible(true);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('prescription.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('prescription.subtitle')}
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 shadow-lg mb-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="imageUrl"
              label={t('prescription.prescriptionImage')}
              rules={[{ required: !fileList.length, message: t('prescription.imageRequired') }]}
            >
              <Input type="hidden" />
            </Form.Item>

            <Form.Item label={t('prescription.uploadLabel')}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                onPreview={handleUpload}
                maxCount={1}
                accept="image/*"
              >
                {fileList.length < 1 && (
                  <div>
                    <UploadOutlined className="text-2xl" />
                    <div className="mt-2">{t('common.upload')}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              name="notes"
              label={t('prescription.notes')}
            >
              <TextArea
                rows={4}
                placeholder={t('prescription.notesPlaceholder')}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
                icon={<UploadOutlined />}
              >
                {t('prescription.submitPrescription')}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* My Prescriptions */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('prescription.uploadedPrescriptions')}
          </h2>
          {fetching ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : prescriptions.length === 0 ? (
            <Empty description={t('profile.noPrescriptions')} />
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card
                  key={prescription._id}
                  className="bg-gray-50 dark:bg-gray-700"
                  actions={[
                      <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleView(prescription.imageUrl)}
                    >
                      {t('common.view')}
                    </Button>
                  ]}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={prescription.imageUrl}
                        alt="Prescription"
                        className="rounded-lg"
                        width={150}
                        height={150}
                        preview={false}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Tag color={getStatusColor(prescription.status)}>
                          {prescription.status.toUpperCase()}
                        </Tag>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {dayjs(prescription.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </span>
                      </div>
                      {prescription.notes && (
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          <strong>{t('prescription.yourNotes')}:</strong> {prescription.notes}
                        </p>
                      )}
                      {prescription.adminNotes && (
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          <strong>{t('prescription.adminNotes')}:</strong> {prescription.adminNotes}
                        </p>
                      )}
                      {prescription.booking && (
                        <div className="mt-2">
                          <Tag color="green">{t('admin.bookings.bookingCreated')}</Tag>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => navigate('/profile')}
                          >
                            {t('prescription.viewBooking')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* View Image Modal */}
        {viewModalVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setViewModalVisible(false)}
          >
            <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('prescription.prescriptionImage')}
                </h3>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => setViewModalVisible(false)}
                >
                  {t('common.close')}
                </Button>
              </div>
              <Image
                src={viewingImage}
                alt="Prescription"
                className="w-full"
                preview={{
                  mask: 'Preview'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadTestPrescriptionPage;

