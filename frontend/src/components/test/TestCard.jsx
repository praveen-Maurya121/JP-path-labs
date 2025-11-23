import { Card, Button, Tag, Tooltip } from 'antd';
import { ExperimentOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';

const TestCard = ({ test, onAddToCart }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (test.isActive) {
      addToCart(test);
      if (onAddToCart) onAddToCart(test);
    }
  };

  return (
    <Card
      className="bg-surface shadow-soft hover:shadow-xl transition-all duration-300 h-full"
      hoverable
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-surface flex-1">{test.name}</h3>
        <Tag color={test.isActive ? 'green' : 'red'}>
          {test.isActive ? t('admin.tests.active') : t('admin.tests.inactive')}
        </Tag>
      </div>

      <Tag color="blue" className="mb-3">{test.category}</Tag>

      {test.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {test.description}
        </p>
      )}

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <ExperimentOutlined className="mr-2" />
          <span>{t('testCard.sample')}: {test.sampleType}</span>
        </div>
        {test.preparation && (
          <Tooltip title={test.preparation}>
            <p className="text-gray-500 dark:text-gray-500 text-xs line-clamp-1">
              {t('testCard.prep')}: {test.preparation}
            </p>
          </Tooltip>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xl sm:text-2xl font-bold text-french-rose-500">
          ₹{test.price}
        </span>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          disabled={!test.isActive}
          className="bg-french-rose-500 hover:bg-french-rose-600 border-none w-full sm:w-auto"
        >
          <span className="hidden sm:inline">{t('home.addToCart')}</span>
          <span className="sm:hidden">{t('common.add')}</span>
        </Button>
      </div>
    </Card>
  );
};

export default TestCard;

