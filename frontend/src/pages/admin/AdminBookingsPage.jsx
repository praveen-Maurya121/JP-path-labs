import { useState, useEffect } from 'react';
import { Card, Table, Select, Input, Tag, Statistic, App, Button, Modal, Form, Upload, Tabs, Image, DatePicker, TimePicker, Space } from 'antd';
import { SearchOutlined, UploadOutlined, FileTextOutlined, EyeOutlined, PhoneOutlined, CalendarOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const AdminBookingsPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionLoading, setPrescriptionLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [prescriptionStatusFilter, setPrescriptionStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [prescriptionViewModalVisible, setPrescriptionViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [reportForm] = Form.useForm();
  const [bookingForm] = Form.useForm();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchPrescriptions();
    fetchTests();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, search]);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, prescriptionStatusFilter, prescriptionSearch]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      console.log('Bookings fetched:', response.data);
      // Log testReports for each booking
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((booking, idx) => {
          if (booking.testReports && booking.testReports.length > 0) {
            console.log(`Booking ${idx} has ${booking.testReports.length} reports:`, booking.testReports);
          }
        });
      }
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions/admin');
      console.log('Prescriptions fetched:', response.data);
      // Log each prescription's imageUrl for debugging
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((prescription, idx) => {
          console.log(`Prescription ${idx}:`, {
            id: prescription._id,
            imageUrl: prescription.imageUrl,
            hasImageUrl: !!prescription.imageUrl,
            user: prescription.user?.name
          });
        });
      }
      setPrescriptions(response.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      message.error('Failed to fetch prescriptions. Please check console for details.');
      setPrescriptions([]);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await api.get('/tests?activeOnly=true');
      const testsData = response.data?.tests || response.data || [];
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (statusFilter) {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.patientName.toLowerCase().includes(search.toLowerCase()) ||
          b.user?.phone?.includes(search) ||
          b.user?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    if (prescriptionStatusFilter) {
      filtered = filtered.filter((p) => p.status === prescriptionStatusFilter);
    }

    if (prescriptionSearch) {
      filtered = filtered.filter(
        (p) =>
          p.user?.name.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
          p.user?.phone?.includes(prescriptionSearch) ||
          p.user?.email?.toLowerCase().includes(prescriptionSearch.toLowerCase())
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      message.success(t('messages.statusUpdated'));
      fetchBookings();
    } catch (error) {
      message.error(t('messages.statusUpdateFailed'));
    }
  };

  const handlePrescriptionStatusChange = async (prescriptionId, newStatus, adminNotes = '') => {
    try {
      await api.put(`/prescriptions/${prescriptionId}/status`, { status: newStatus, adminNotes });
      message.success(t('messages.statusUpdated'));
      fetchPrescriptions();
    } catch (error) {
      message.error(t('messages.statusUpdateFailed'));
    }
  };

  const handleCreateBookingFromPrescription = async (values) => {
    try {
      const response = await api.post(`/prescriptions/${selectedPrescription._id}/create-booking`, {
        tests: values.tests.map(t => ({ test: t, quantity: 1 })),
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime.format('HH:mm'),
        patientName: values.patientName || selectedPrescription.user.name,
        address: values.address || selectedPrescription.user.address || '',
        notes: values.notes || ''
      });
      message.success('Booking created successfully!');
      setBookingModalVisible(false);
      bookingForm.resetFields();
      setSelectedPrescription(null);
      fetchBookings();
      fetchPrescriptions();
      setActiveTab('bookings');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const openBookingModal = (prescription) => {
    setSelectedPrescription(prescription);
    bookingForm.setFieldsValue({
      patientName: prescription.user.name,
      address: prescription.user.address || ''
    });
    setBookingModalVisible(true);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const prescriptionStats = {
    total: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === 'pending').length,
    reviewed: prescriptions.filter((p) => p.status === 'reviewed').length,
    booked: prescriptions.filter((p) => p.status === 'booked').length,
    rejected: prescriptions.filter((p) => p.status === 'rejected').length,
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleReportUpload = async ({ file }) => {
    if (file) {
      const base64 = await getBase64(file.originFileObj || file);
      reportForm.setFieldsValue({ reportUrl: base64 });
    }
  };

  const handleReportSubmit = async (values) => {
    try {
      await api.post(`/bookings/${selectedBooking._id}/reports`, values);
      message.success(t('messages.reportUploaded'));
      setReportModalVisible(false);
      reportForm.resetFields();
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      message.error(error.response?.data?.message || t('messages.reportUploadFailed'));
    }
  };

  const openReportModal = (booking) => {
    setSelectedBooking(booking);
    setReportModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      reviewed: 'blue',
      booked: 'green',
      rejected: 'red',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
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
      title: 'Phone',
      dataIndex: 'user',
      key: 'phone',
      render: (user) => user?.phone || 'N/A',
    },
    {
      title: 'Tests',
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
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `₹${price}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record._id, value)}
          style={{ width: 120 }}
        >
          <Option value="pending">Pending</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: 'Reports',
      key: 'reports',
      render: (_, record) => {
        const hasReports = record.testReports && Array.isArray(record.testReports) && record.testReports.length > 0;
        return (
          <div>
            {hasReports ? (
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedBooking(record);
                  setReportModalVisible(true);
                }}
              >
                View Reports ({record.testReports.length})
              </Button>
            ) : (
              <span className="text-gray-400">No reports</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => {
              if (record.status === 'completed') {
                openReportModal(record);
              } else {
                message.warning('Reports can only be uploaded for completed bookings. Please mark booking as completed first.');
              }
            }}
          >
            Upload Report
          </Button>
        </Space>
      ),
    },
  ];

  const prescriptionColumns = [
    {
      title: t('common.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: t('admin.bookings.user'),
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div>
          <div className="font-semibold">{user?.name}</div>
          <div className="text-sm text-gray-500">{user?.phone}</div>
          {user?.email && <div className="text-sm text-gray-500">{user?.email}</div>}
        </div>
      ),
    },
    {
      title: t('admin.bookings.prescription'),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedPrescription(record);
            setPrescriptionViewModalVisible(true);
          }}
        >
          {t('admin.bookings.viewImage')}
        </Button>
      ),
    },
    {
      title: t('prescription.yourNotes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes ? <span className="line-clamp-2 text-sm">{notes}</span> : <span className="text-gray-400">-</span>,
      ellipsis: true,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handlePrescriptionStatusChange(record._id, value)}
          style={{ width: 120 }}
        >
          <Option value="pending">{t('profile.prescriptionStatus.pending')}</Option>
          <Option value="reviewed">{t('profile.prescriptionStatus.reviewed')}</Option>
          <Option value="booked">{t('profile.prescriptionStatus.booked')}</Option>
          <Option value="rejected">{t('profile.prescriptionStatus.rejected')}</Option>
        </Select>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => openBookingModal(record)}
            disabled={record.status === 'booked'}
            size="small"
            className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
          >
            {t('admin.bookings.createBooking')}
          </Button>
          {record.booking && (
            <Tag color="green">{t('admin.bookings.bookingCreated')}</Tag>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'bookings',
      label: `${t('admin.bookings.bookings')} (${bookings.length})`,
      children: (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('common.total')} value={stats.total} valueStyle={{ color: '#e65286' }} />
            </Card>
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('profile.bookingStatus.pending')} value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
            </Card>
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('profile.bookingStatus.confirmed')} value={stats.confirmed} valueStyle={{ color: '#1890ff' }} />
            </Card>
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('profile.bookingStatus.completed')} value={stats.completed} valueStyle={{ color: '#52c41a' }} />
            </Card>
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('profile.bookingStatus.cancelled')} value={stats.cancelled} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-surface shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Search
                placeholder={t('admin.bookings.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
              <Select
                placeholder={t('admin.bookings.filterByStatus')}
                className="w-full"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value="pending">{t('profile.bookingStatus.pending')}</Option>
                <Option value="confirmed">{t('profile.bookingStatus.confirmed')}</Option>
                <Option value="completed">{t('profile.bookingStatus.completed')}</Option>
                <Option value="cancelled">{t('profile.bookingStatus.cancelled')}</Option>
              </Select>
            </div>
          </Card>

          {/* Table */}
          <Card className="bg-surface shadow-soft">
            <div className="overflow-x-auto">
              <Table
                dataSource={filteredBookings}
                columns={bookingColumns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'prescriptions',
      label: `${t('admin.bookings.prescriptions')} (${prescriptions.length})`,
      children: (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('common.total')} value={prescriptionStats.total} valueStyle={{ color: '#e65286' }} />
            </Card>
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('profile.prescriptionStatus.pending')} value={prescriptionStats.pending} valueStyle={{ color: '#fa8c16' }} />
            </Card>
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('profile.prescriptionStatus.reviewed')} value={prescriptionStats.reviewed} valueStyle={{ color: '#1890ff' }} />
            </Card>
            <Card className="bg-surface shadow-soft">
              <Statistic title={t('profile.prescriptionStatus.booked')} value={prescriptionStats.booked} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-surface shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Search
                placeholder={t('admin.bookings.searchPrescriptionPlaceholder')}
                prefix={<SearchOutlined />}
                value={prescriptionSearch}
                onChange={(e) => setPrescriptionSearch(e.target.value)}
                allowClear
              />
              <Select
                placeholder={t('admin.bookings.filterByStatus')}
                className="w-full"
                value={prescriptionStatusFilter}
                onChange={setPrescriptionStatusFilter}
                allowClear
              >
                <Option value="pending">{t('profile.prescriptionStatus.pending')}</Option>
                <Option value="reviewed">{t('profile.prescriptionStatus.reviewed')}</Option>
                <Option value="booked">{t('profile.prescriptionStatus.booked')}</Option>
                <Option value="rejected">{t('profile.prescriptionStatus.rejected')}</Option>
              </Select>
            </div>
          </Card>

          {/* Table */}
          <Card className="bg-surface shadow-soft">
            <div className="overflow-x-auto">
              {filteredPrescriptions.length === 0 && !prescriptionLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('admin.bookings.noPrescriptionsFound')}
                  </p>
                </div>
              ) : (
                <Table
                  dataSource={filteredPrescriptions}
                  columns={prescriptionColumns}
                  rowKey="_id"
                  loading={prescriptionLoading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              )}
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title={t('admin.bookings.title')}
      description={t('admin.bookings.description')}
    >
      <div className="space-y-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        {/* Test Report Upload Modal */}
        <Modal
          title="Upload Test Report"
          open={reportModalVisible}
          onCancel={() => {
            setReportModalVisible(false);
            reportForm.resetFields();
            setSelectedBooking(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 600 }}
        >
          {selectedBooking && (
            <div>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                <strong>Booking:</strong> {selectedBooking.patientName} - {dayjs(selectedBooking.appointmentDate).format('DD MMM YYYY')}
              </p>
              <Form
                form={reportForm}
                layout="vertical"
                onFinish={handleReportSubmit}
              >
                <Form.Item
                  name="testName"
                  label="Test Name"
                  rules={[{ required: true, message: 'Please enter test name' }]}
                >
                  <Input placeholder="Enter test name" />
                </Form.Item>
                <Form.Item
                  name="reportUrl"
                  label="Report File"
                  rules={[{ required: true, message: 'Please upload report file' }]}
                >
                  <Upload
                    beforeUpload={() => false}
                    onChange={handleReportUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload Report</Button>
                  </Upload>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
                  >
                    Upload Report
                  </Button>
                </Form.Item>
              </Form>

                  {selectedBooking.testReports && selectedBooking.testReports.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-3">{t('admin.bookings.existingReports')} ({selectedBooking.testReports.length})</h4>
                  <div className="space-y-2">
                    {selectedBooking.testReports.map((report, idx) => {
                      const handleViewReport = () => {
                        if (report.reportUrl.startsWith('data:')) {
                          // For base64, create blob URL
                          try {
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
                            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                          } catch (error) {
                            console.error('Error opening report:', error);
                            message.error(t('messages.viewFailed'));
                          }
                        } else {
                          window.open(report.reportUrl, '_blank');
                        }
                      };

                      const handleDownloadReport = () => {
                        try {
                          const link = document.createElement('a');
                          link.href = report.reportUrl;
                          
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

                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex-1">
                            <div className="font-medium">{report.testName}</div>
                            <div className="text-sm text-gray-500">
                              {t('common.upload')}: {dayjs(report.uploadedAt).format('DD MMM YYYY, hh:mm A')}
                            </div>
                          </div>
                          <Space>
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={handleViewReport}
                            >
                              {t('common.view')}
                            </Button>
                            <Button
                              type="link"
                              icon={<DownloadOutlined />}
                              onClick={handleDownloadReport}
                            >
                              {t('common.download')}
                            </Button>
                          </Space>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Create Booking from Prescription Modal */}
        <Modal
          title="Create Booking from Prescription"
          open={bookingModalVisible}
          onCancel={() => {
            setBookingModalVisible(false);
            bookingForm.resetFields();
            setSelectedPrescription(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 800 }}
        >
          {selectedPrescription && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">User Information</h4>
                <p><strong>Name:</strong> {selectedPrescription.user?.name}</p>
                <p><strong>Phone:</strong> {selectedPrescription.user?.phone}</p>
                {selectedPrescription.user?.email && <p><strong>Email:</strong> {selectedPrescription.user.email}</p>}
                {selectedPrescription.user?.address && <p><strong>Address:</strong> {selectedPrescription.user.address}</p>}
                {selectedPrescription.notes && <p><strong>User Notes:</strong> {selectedPrescription.notes}</p>}
              </div>
              <Form
                form={bookingForm}
                layout="vertical"
                onFinish={handleCreateBookingFromPrescription}
              >
                <Form.Item
                  name="tests"
                  label="Select Tests"
                  rules={[{ required: true, message: 'Please select at least one test' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select tests"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={tests.map(test => ({
                      value: test._id,
                      label: `${test.name} - ₹${test.price}`
                    }))}
                  />
                </Form.Item>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="appointmentDate"
                    label="Appointment Date"
                    rules={[{ required: true, message: 'Please select appointment date' }]}
                  >
                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                  </Form.Item>
                  <Form.Item
                    name="appointmentTime"
                    label="Appointment Time"
                    rules={[{ required: true, message: 'Please select appointment time' }]}
                  >
                    <TimePicker className="w-full" format="HH:mm" />
                  </Form.Item>
                </div>
                <Form.Item
                  name="patientName"
                  label="Patient Name"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Address"
                >
                  <TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="notes"
                  label="Additional Notes"
                >
                  <TextArea rows={3} />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
                    icon={<CalendarOutlined />}
                  >
                    Create Booking
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* View Prescription Image Modal */}
        <Modal
          title={t('prescription.prescriptionImage')}
          open={prescriptionViewModalVisible}
          onCancel={() => {
            setPrescriptionViewModalVisible(false);
            setSelectedPrescription(null);
          }}
          footer={null}
          width="90%"
          style={{ maxWidth: 800 }}
        >
          {selectedPrescription && (
            <div>
              {selectedPrescription.imageUrl ? (
                <Image
                  src={selectedPrescription.imageUrl}
                  alt="Prescription"
                  className="w-full"
                  preview={{
                    mask: 'Preview'
                  }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t('admin.bookings.noPrescriptionImage')}
                </div>
              )}
              {selectedPrescription.notes && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="font-semibold text-surface">{t('prescription.yourNotes')}:</p>
                  <p className="text-gray-700 dark:text-gray-300">{selectedPrescription.notes}</p>
                </div>
              )}
              {selectedPrescription.adminNotes && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="font-semibold text-surface">{t('prescription.adminNotes')}:</p>
                  <p className="text-gray-700 dark:text-gray-300">{selectedPrescription.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminBookingsPage;
