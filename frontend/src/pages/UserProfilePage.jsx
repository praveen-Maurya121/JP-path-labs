import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, Table, Tag, Modal, App, Tabs, Empty, Rate, Alert, Image } from 'antd';
import { UserOutlined, EditOutlined, UploadOutlined, DownloadOutlined, EyeOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const { TextArea } = Input;
const { Dragger } = Upload;

const UserProfilePage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { user: currentUser, checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [testimonialForm] = Form.useForm();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewingReport, setPreviewingReport] = useState(null);
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false);
  const [prescriptionViewModalVisible, setPrescriptionViewModalVisible] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchPrescriptions();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/me');
      console.log('Fetched bookings:', response.data);
      // Log testReports for debugging
      response.data.forEach((booking, idx) => {
        if (booking.testReports && booking.testReports.length > 0) {
          console.log(`Booking ${idx} has ${booking.testReports.length} reports:`, booking.testReports);
        }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions/me');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
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

  const handleProfilePictureUpload = async ({ file }) => {
    if (file) {
      const base64 = await getBase64(file.originFileObj || file);
      form.setFieldsValue({ profilePicture: base64 });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = await api.put('/profile', values);
      setProfile(response.data.user);
      setEditing(false);
      message.success('Profile updated successfully');
      checkAuth(); // Refresh auth context
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
      reviewed: 'blue',
      booked: 'green',
      rejected: 'red',
    };
    return colors[status] || 'default';
  };

  const getPrescriptionStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      reviewed: 'blue',
      booked: 'green',
      rejected: 'red',
    };
    return colors[status] || 'default';
  };

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
      render: (tests) => (
        <div>
          {tests.map((item, idx) => (
            <Tag key={idx} className="mb-1">
              {item.test?.name} (x{item.quantity})
            </Tag>
          ))}
        </div>
      ),
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
        const statusMap = {
          pending: t('profile.bookingStatus.pending'),
          confirmed: t('profile.bookingStatus.confirmed'),
          completed: t('profile.bookingStatus.completed'),
          cancelled: t('profile.bookingStatus.cancelled'),
        };
        return <Tag color={getStatusColor(status)}>{statusMap[status]?.toUpperCase() || status.toUpperCase()}</Tag>;
      },
    },
    {
      title: t('profile.viewReports'),
      key: 'reports',
      render: (_, record) => {
        const hasReports = record.testReports && Array.isArray(record.testReports) && record.testReports.length > 0;
        if (hasReports) {
          return (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                console.log('Opening reports for booking:', record);
                console.log('Test reports:', record.testReports);
                setSelectedReport(record);
                setReportModalVisible(true);
              }}
            >
              {t('profile.viewReports')} ({record.testReports.length})
            </Button>
          );
        }
        return <span className="text-gray-400">{t('profile.noReports')}</span>;
      },
    },
  ];

  const prescriptionColumns = [
    {
      title: t('prescription.uploadedDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: t('prescription.prescription'),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setViewingPrescription({ imageUrl });
            setPrescriptionViewModalVisible(true);
          }}
        >
          {t('admin.bookings.viewImage')}
        </Button>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: t('profile.prescriptionStatus.pending'),
          reviewed: t('profile.prescriptionStatus.reviewed'),
          booked: t('profile.prescriptionStatus.booked'),
          rejected: t('profile.prescriptionStatus.rejected'),
        };
        return <Tag color={getPrescriptionStatusColor(status)}>{statusMap[status]?.toUpperCase() || status.toUpperCase()}</Tag>;
      },
    },
    {
      title: t('prescription.yourNotes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes ? <span className="line-clamp-2 text-sm">{notes}</span> : <span className="text-gray-400">-</span>,
      ellipsis: true,
    },
    {
      title: t('prescription.adminNotes'),
      dataIndex: 'adminNotes',
      key: 'adminNotes',
      render: (adminNotes) => adminNotes ? <span className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{adminNotes}</span> : <span className="text-gray-400">-</span>,
      ellipsis: true,
    },
    {
      title: t('prescription.booking'),
      dataIndex: 'booking',
      key: 'booking',
      render: (booking) => {
        if (booking) {
          return (
            <Tag color="green">{t('admin.bookings.bookingCreated')}</Tag>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Link to="/upload-prescription">
          <Button type="link" size="small" icon={<FileTextOutlined />}>
            {t('common.view')} {t('common.details')}
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-french-rose-500"></div>
      </div>
    );
  }

  const handleTestimonialSubmit = async (values) => {
    try {
      setTestimonialSubmitting(true);
      await api.post('/testimonials/user', values);
      message.success(t('messages.testimonialSubmitted'));
      testimonialForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || t('messages.testimonialSubmitFailed'));
    } finally {
      setTestimonialSubmitting(false);
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: t('common.profile'),
      children: (
        <Card className="bg-surface shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-surface">{t('profile.profileInfo')}</h2>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditing(!editing)}
              className="bg-french-rose-500 hover:bg-french-rose-600 border-none w-full sm:w-auto"
            >
              {editing ? t('common.cancel') : t('profile.editProfile')}
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={profile}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Avatar
                size={{ xs: 80, sm: 100, md: 120 }}
                src={profile?.profilePicture}
                icon={<UserOutlined />}
                className="border-4 border-french-rose-200"
              />
              {editing && (
                <div className="w-full sm:w-auto">
                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleProfilePictureUpload}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />} className="w-full sm:w-auto">{t('profile.changePhoto')}</Button>
                  </Upload>
                </div>
              )}
            </div>

            <Form.Item name="profilePicture" hidden>
              <Input />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={t('profile.fullName')}
                rules={[{ required: true, message: t('profile.fullName') + ' ' + t('common.error') }]}
              >
                <Input disabled={!editing} />
              </Form.Item>

              <Form.Item
                name="email"
                label={t('profile.email')}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="phone"
                label={t('profile.phone')}
              >
                <Input disabled={!editing} placeholder={t('profile.phone')} />
              </Form.Item>

              <Form.Item
                name="address"
                label={t('profile.address')}
              >
                <TextArea rows={2} disabled={!editing} placeholder={t('profile.address')} />
              </Form.Item>
            </div>

            <Form.Item
              name="bio"
              label={t('profile.bio')}
            >
              <TextArea rows={4} disabled={!editing} placeholder={t('profile.bio')} />
            </Form.Item>

            {editing && (
              <>
                <Form.Item
                  name="password"
                  label={t('profile.newPassword')}
                  rules={[
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password placeholder={t('profile.newPassword')} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
                  >
                    {t('profile.saveChanges')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form>
        </Card>
      ),
    },
    {
      key: 'bookings',
      label: t('profile.bookingHistory'),
      children: (
        <div className="space-y-6">
          {/* Bookings Section */}
          <Card className="bg-surface shadow-soft">
                <h2 className="text-2xl font-bold text-surface mb-4">{t('profile.myBookings')}</h2>
                {bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table
                      dataSource={bookings}
                      columns={bookingColumns}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 800 }}
                    />
                  </div>
                ) : (
                  <Empty description={t('profile.noBookings')} />
                )}
              </Card>

              {/* Prescriptions Section */}
              <Card className="bg-surface shadow-soft">
                <h2 className="text-2xl font-bold text-surface mb-4">{t('profile.uploadedPrescriptions')}</h2>
                {prescriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table
                      dataSource={prescriptions}
                      columns={prescriptionColumns}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 800 }}
                    />
                  </div>
                ) : (
                  <Empty description={t('profile.noPrescriptions')} />
                )}
          </Card>
        </div>
      ),
    },
    {
      key: 'testimonial',
      label: (
        <>
          <MessageOutlined /> {t('profile.submitTestimonial')}
        </>
      ),
      children: (
        <Card className="bg-surface shadow-soft">
          <h2 className="text-2xl font-bold text-surface mb-4">{t('profile.shareExperience')}</h2>
          <Alert
            message={t('profile.testimonialNote')}
            type="info"
            showIcon
            className="mb-6"
          />
          <Form
            form={testimonialForm}
            layout="vertical"
            onFinish={handleTestimonialSubmit}
          >
            <Form.Item
              name="rating"
              label={t('profile.rating')}
              rules={[{ required: true, message: t('profile.ratingRequired') }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item
              name="message"
              label={t('profile.testimonial')}
              rules={[
                { required: true, message: t('profile.testimonialRequired') },
                { min: 10, message: t('profile.testimonialMinLength') }
              ]}
            >
              <TextArea
                rows={6}
                placeholder={t('profile.testimonialPlaceholder')}
                maxLength={500}
                showCount
              />
            </Form.Item>
            <Form.Item
              name="location"
              label={t('profile.location')}
            >
              <Input placeholder={t('profile.locationPlaceholder')} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={testimonialSubmitting}
                block
                className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
                size="large"
              >
                {t('profile.submitTestimonial')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-8">
        {t('profile.title')}
      </h1>

      <Tabs items={tabItems} className="w-full" />

        <Modal
          title={t('profile.viewReports')}
          open={reportModalVisible}
          onCancel={() => {
            setReportModalVisible(false);
            setSelectedReport(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 900 }}
        >
          {selectedReport && (
            <div className="space-y-4">
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>{t('common.date')}:</strong> {dayjs(selectedReport.appointmentDate).format('DD MMM YYYY, hh:mm A')}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>{t('cart.patientName')}:</strong> {selectedReport.patientName}
                </p>
              </div>
              <div className="space-y-3">
                {(() => {
                  console.log('Selected report booking:', selectedReport);
                  console.log('Selected report testReports:', selectedReport.testReports);
                  const reports = selectedReport.testReports || [];
                  console.log('Reports array length:', reports.length);
                  if (reports.length === 0) {
                    return (
                      <Empty 
                        description={t('profile.noReports')} 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    );
                  }
                  return reports.map((report, idx) => {
                    const handleDownload = () => {
                      try {
                        const link = document.createElement('a');
                        link.href = report.reportUrl;
                        
                        // Determine file extension from reportUrl
                        let extension = 'pdf';
                        if (report.reportUrl.startsWith('data:')) {
                          const match = report.reportUrl.match(/data:([^;]+);/);
                          if (match && match[1].includes('pdf')) {
                            extension = 'pdf';
                          } else if (match && match[1].includes('image')) {
                            extension = match[1].split('/')[1] || 'png';
                          }
                        }
                        
                        link.download = `${report.testName.replace(/[^a-z0-9]/gi, '_')}_${dayjs(report.uploadedAt).format('YYYY-MM-DD')}.${extension}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        message.success(t('messages.downloadStarted'));
                      } catch (error) {
                        console.error('Download error:', error);
                        message.error(t('messages.downloadFailed'));
                      }
                    };

                    const handleView = () => {
                      try {
                        // Check if it's a base64 data URL or regular URL
                        if (report.reportUrl.startsWith('data:')) {
                          // For base64 PDFs, create a blob URL
                          const byteString = atob(report.reportUrl.split(',')[1]);
                          const mimeString = report.reportUrl.split(',')[0].split(':')[1].split(';')[0];
                          const ab = new ArrayBuffer(byteString.length);
                          const ia = new Uint8Array(ab);
                          for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                          }
                          const blob = new Blob([ab], { type: mimeString });
                          const blobUrl = URL.createObjectURL(blob);
                          window.open(blobUrl, '_blank');
                          // Clean up after a delay
                          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                        } else {
                          // For regular URLs, open directly
                          window.open(report.reportUrl, '_blank');
                        }
                      } catch (error) {
                        console.error('View error:', error);
                        message.error(t('messages.viewFailed'));
                      }
                    };

                    // Get preview URL (convert base64 to blob URL if needed)
                    const getPreviewUrl = () => {
                      if (report.reportUrl.startsWith('data:')) {
                        try {
                          const byteString = atob(report.reportUrl.split(',')[1]);
                          const mimeString = report.reportUrl.split(',')[0].split(':')[1].split(';')[0];
                          const ab = new ArrayBuffer(byteString.length);
                          const ia = new Uint8Array(ab);
                          for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                          }
                          const blob = new Blob([ab], { type: mimeString });
                          return URL.createObjectURL(blob);
                        } catch (error) {
                          return report.reportUrl;
                        }
                      }
                      return report.reportUrl;
                    };

                    const reportKey = `${report.testName}-${report.uploadedAt}-${idx}`;
                    const isPreviewing = previewingReport === reportKey;

                    return (
                      <Card key={idx} className="bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-surface mb-1">{report.testName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Uploaded: {dayjs(report.uploadedAt).format('DD MMM YYYY, hh:mm A')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="default"
                              icon={<EyeOutlined />}
                              onClick={() => setPreviewingReport(isPreviewing ? null : reportKey)}
                            >
                              {isPreviewing ? t('common.hidePreview') : t('common.preview')}
                            </Button>
                            <Button
                              type="default"
                              icon={<EyeOutlined />}
                              onClick={handleView}
                            >
                              {t('common.openInNewTab')}
                            </Button>
                            <Button
                              type="primary"
                              icon={<DownloadOutlined />}
                              onClick={handleDownload}
                              className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
                            >
                              {t('common.download')}
                            </Button>
                          </div>
                        </div>
                        {isPreviewing && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-surface">{t('common.pdfPreview')}:</span>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => setPreviewingReport(null)}
                              >
                                {t('common.closePreview')}
                              </Button>
                            </div>
                            <div className="w-full bg-white dark:bg-gray-900 rounded" style={{ height: '600px', overflow: 'auto' }}>
                              <iframe
                                src={getPreviewUrl()}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title={report.testName}
                              />
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </Modal>

        {/* Prescription View Modal */}
        <Modal
          title={t('prescription.prescriptionImage')}
          open={prescriptionViewModalVisible}
          onCancel={() => {
            setPrescriptionViewModalVisible(false);
            setViewingPrescription(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 800 }}
        >
          {viewingPrescription?.imageUrl && (
            <Image
              src={viewingPrescription.imageUrl}
              alt="Prescription"
              className="w-full"
              preview={{
                mask: 'Preview'
              }}
            />
          )}
        </Modal>
    </div>
  );
};

export default UserProfilePage;

