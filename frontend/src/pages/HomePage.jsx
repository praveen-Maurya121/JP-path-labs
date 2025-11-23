import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Carousel, Rate, Spin, Empty, Avatar } from 'antd';
import { ExperimentOutlined, ShoppingCartOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { useCart } from '../contexts/CartContext';
import TestCard from '../components/test/TestCard';

const HomePage = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [notes, setNotes] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, notesRes, galleryRes, testimonialsRes, doctorsRes] = await Promise.all([
        api.get('/tests?activeOnly=true&limit=6'),
        api.get('/notes'),
        api.get('/gallery?activeOnly=true'),
        api.get('/testimonials?activeOnly=true'),
        api.get('/doctors?activeOnly=true'),
      ]);
      
      // Handle paginated response
      const testsData = testsRes.data?.tests || testsRes.data || [];
      const testsArray = Array.isArray(testsData) ? testsData : [];
      setTests(testsArray.slice(0, 6));
      
      setNotes(notesRes.data || []);
      setGallery(galleryRes.data || []);
      setTestimonials(testimonialsRes.data || []);
      setDoctors(doctorsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTests([]);
      setNotes([]);
      setGallery([]);
      setTestimonials([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Get hero image (only one should exist)
  const heroImage = gallery.find(item => item.isHero && item.isActive)?.imageUrl || null;
  // Get gallery images (non-hero, active images)
  const galleryImages = gallery.filter(item => !item.isHero && item.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroImage})`
            : 'linear-gradient(135deg, #e65286 0%, #b71f48 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{t('home.title')}</h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 px-2">{t('home.subtitle')}</p>
          <Link to="/tests">
            <Button
              type="primary"
              size="large"
              className="bg-french-rose-500 hover:bg-french-rose-600 border-none text-sm sm:text-base"
            >
              {t('home.viewAll')} <RightOutlined />
            </Button>
          </Link>
        </div>
      </section>

      {/* Doctor Reviews Section */}
      {doctors.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              {t('home.doctorReviews')}
            </h2>
            <div className="overflow-hidden">
              <Carousel
                autoplay
                autoplaySpeed={4000}
                dots={false}
                infinite
                slidesToShow={3}
                slidesToScroll={1}
                responsive={[
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                    },
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                    },
                  },
                ]}
                className="doctor-carousel"
              >
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="px-2 sm:px-3 md:px-4">
                    <Card className="bg-surface shadow-soft hover:shadow-xl transition-shadow border-none">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <Avatar
                          size={{ xs: 60, sm: 80, md: 100 }}
                          src={doctor.imageUrl}
                          icon={<UserOutlined />}
                          className="border-4 border-french-rose-200 flex-shrink-0"
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {doctor.name}
                          </h4>
                          <p className="text-xs sm:text-sm md:text-base text-french-rose-600 dark:text-french-rose-400 mb-2 sm:mb-3">
                            {doctor.specialization}
                          </p>
                          <Rate disabled value={doctor.rating} className="mb-2 sm:mb-3 text-xs sm:text-sm" />
                          <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 italic line-clamp-3">
                            "{doctor.review}"
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* Test Catalog Preview */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t('home.popularTests')}
            </h2>
            <Link to="/tests">
              <Button type="link" className="text-french-rose-500 text-sm sm:text-base">
                {t('home.viewAll')} <RightOutlined />
              </Button>
            </Link>
          </div>
          {tests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <TestCard key={test._id} test={test} onAddToCart={addToCart} />
              ))}
            </div>
          ) : (
            <Empty description={t('tests.noTestsFound')} />
          )}
        </div>
      </section>

      {/* Notes Section */}
      {notes.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
              {t('home.notes')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <Card
                  key={note._id}
                  className="bg-surface shadow-soft hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2 text-surface">{note.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                    {note.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              {t('home.gallery')}
            </h2>
            <Carousel autoplay className="max-w-4xl mx-auto">
              {galleryImages.map((item) => (
                <div key={item._id} className="px-1 sm:px-2">
                  <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4 md:p-6">
                      <h3 className="text-white text-sm sm:text-base md:text-xl font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="text-white/90 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              {t('home.testimonials')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial._id}
                  className="bg-surface shadow-soft hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    {testimonial.avatarUrl ? (
                      <img
                        src={testimonial.avatarUrl}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-french-rose-200 dark:bg-french-rose-800 flex items-center justify-center mr-4">
                        <span className="text-french-rose-600 dark:text-french-rose-300 font-semibold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-surface">{testimonial.name}</h4>
                      {testimonial.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <Rate disabled value={testimonial.rating} className="mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "{testimonial.message}"
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

