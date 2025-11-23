import { useState, useEffect } from 'react';
import { Input, Select, Switch, Spin, Empty, Tag, Button, Card } from 'antd';
import { SearchOutlined, ExperimentOutlined, ReloadOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../contexts/CartContext';
import TestCard from '../components/test/TestCard';

const { Search } = Input;
const { Option } = Select;

const TestCatalogPage = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchTests(1, true);
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    fetchTests(1, true);
  }, [search, category, activeOnly]);

  const fetchCategories = async () => {
    try {
      // Fetch all categories by getting first page with large limit
      const response = await api.get('/tests?limit=1000&activeOnly=false');
      const allTests = response.data?.tests || response.data || [];
      const uniqueCategories = [...new Set(allTests.map((test) => test.category).filter(Boolean))];
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTests = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        activeOnly: activeOnly.toString()
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await api.get(`/tests?${params.toString()}`);
      
      if (response.data.pagination) {
        // New paginated response
        if (reset) {
          setTests(response.data.tests);
        } else {
          setTests(prev => [...prev, ...response.data.tests]);
        }
        setPagination(response.data.pagination);
      } else {
        // Fallback for old response format
        const allTests = response.data.tests || response.data;
        if (reset) {
          setTests(allTests);
        } else {
          setTests(prev => [...prev, ...allTests]);
        }
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchTests(pagination.currentPage + 1, false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tests.title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t('tests.subtitle')}
        </p>
      </div>

      {/* Upload Prescription Banner */}
      <Card className="bg-gradient-to-r from-french-rose-500 to-french-rose-600 text-white mb-4 sm:mb-6 md:mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileTextOutlined className="text-xl sm:text-2xl" />
              <h3 className="text-lg sm:text-xl font-bold">{t('tests.prescriptionBanner.title')}</h3>
            </div>
            <p className="text-sm sm:text-base text-white/90">
              {t('tests.prescriptionBanner.description')}
            </p>
          </div>
          <Link to="/upload-prescription">
            <Button
              type="default"
              size="large"
              icon={<FileTextOutlined />}
              className="bg-white text-french-rose-600 hover:bg-gray-100 border-none font-semibold"
            >
              {t('tests.prescriptionBanner.button')}
              <ArrowRightOutlined className="ml-2" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Filters */}
      <div className="bg-surface shadow-soft rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('common.search')}
            </label>
            <Search
              placeholder={t('tests.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tests.category')}
            </label>
            <Select
              placeholder={t('tests.allCategories')}
              className="w-full"
              value={category}
              onChange={setCategory}
              allowClear
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Switch
              checked={activeOnly}
              onChange={setActiveOnly}
              checkedChildren={t('tests.activeOnly')}
              unCheckedChildren={t('tests.allTests')}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Tag color="blue" className="text-xs sm:text-sm">{t('common.total')}: {pagination.totalItems}</Tag>
          <Tag color="green" className="text-xs sm:text-sm">{t('tests.showing')}: {tests.length}</Tag>
          <Tag color="orange" className="text-xs sm:text-sm">{t('tests.page')}: {pagination.currentPage} / {pagination.totalPages}</Tag>
        </div>
      </div>

      {/* Test List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : tests.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tests.map((test) => (
              <TestCard key={test._id} test={test} onAddToCart={addToCart} />
            ))}
          </div>

          {/* Load More Button */}
          {pagination.hasNextPage && (
            <div className="flex justify-center py-6">
              <Button
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={loadMore}
                loading={loadingMore}
                className="bg-french-rose-500 hover:bg-french-rose-600 border-none"
              >
                {loadingMore ? t('common.loading') : t('tests.loadMore')}
              </Button>
            </div>
          )}

          {/* End Message */}
          {!pagination.hasNextPage && tests.length > 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>{t('tests.endOfCatalog')}</p>
              <p className="text-sm mt-2">{t('tests.showingAll')} {pagination.totalItems} {t('tests.tests')}</p>
            </div>
          )}
        </>
      ) : (
        <Empty
          description={t('tests.noTestsFound')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default TestCatalogPage;

