import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
  Box,
  Text,
  HStack,
} from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Zoom } from 'swiper';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface PropertyImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const PropertyImageLightbox: React.FC<PropertyImageLightboxProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [swiper, setSwiper] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen && swiper && swiper.slideTo) {
      try {
        swiper.slideTo(initialIndex, 0);
        setCurrentIndex(initialIndex);
      } catch (error) {
        console.error('Error navigating to slide:', error);
      }
    }
  }, [isOpen, initialIndex, swiper]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSlideChange = (swiper: any) => {
    setCurrentIndex(swiper.activeIndex);
  };

  const validImages = images.filter(
    (img) => img && typeof img === 'string' && img.trim() !== ''
  );

  if (validImages.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(10px)" />
      <ModalContent bg="transparent" boxShadow="none" maxW="100vw" maxH="100vh">
        <ModalBody p={0} position="relative">
          {/* Close Button */}
          <IconButton
            aria-label="Close gallery"
            icon={<FiX />}
            position="absolute"
            top={4}
            right={4}
            zIndex={1000}
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            borderRadius="full"
            size="lg"
            onClick={onClose}
            _hover={{ bg: 'rgba(0, 0, 0, 0.9)' }}
          />

          {/* Image Counter */}
          <Box
            position="absolute"
            top={4}
            left="50%"
            transform="translateX(-50%)"
            zIndex={1000}
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            px={4}
            py={2}
            borderRadius="full"
            fontSize="sm"
            fontWeight="500"
          >
            {currentIndex + 1} / {validImages.length}
          </Box>

          {/* Swiper Gallery */}
          <Box
            sx={{
              '.lightbox-swiper': {
                width: '100%',
                height: '100vh',
                '& .swiper-slide': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& img': {
                    maxWidth: '100%',
                    maxHeight: '100vh',
                    objectFit: 'contain',
                    display: 'block',
                  },
                },
                '& .swiper-button-next, & .swiper-button-prev': {
                  color: 'white',
                  background: 'rgba(0, 0, 0, 0.6)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  '&:after': {
                    fontSize: '20px',
                    fontWeight: 'bold',
                  },
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.8)',
                  },
                },
                '& .swiper-pagination': {
                  bottom: '20px',
                },
                '& .swiper-pagination-bullet': {
                  background: 'white',
                  opacity: 0.5,
                  width: '10px',
                  height: '10px',
                  '&.swiper-pagination-bullet-active': {
                    opacity: 1,
                    background: 'white',
                  },
                },
              },
            }}
          >
            <Swiper
              key={`lightbox-${isOpen}-${initialIndex}`}
              onSwiper={(swiperInstance) => {
                if (swiperInstance) {
                  setSwiper(swiperInstance);
                  // Navigate to initial index after swiper is ready
                  setTimeout(() => {
                    if (swiperInstance && swiperInstance.slideTo) {
                      try {
                        swiperInstance.slideTo(initialIndex, 0);
                        setCurrentIndex(initialIndex);
                      } catch (error) {
                        console.error('Error setting initial slide:', error);
                      }
                    }
                  }, 150);
                }
              }}
              modules={[Navigation, Pagination, Keyboard, Zoom]}
              navigation={true}
              pagination={{ clickable: true, dynamicBullets: true }}
              keyboard={{ enabled: true }}
              zoom={{ maxRatio: 3 }}
              className="lightbox-swiper"
              initialSlide={initialIndex}
              onSlideChange={handleSlideChange}
              spaceBetween={0}
            >
              {validImages.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <Box className="swiper-zoom-container">
                    <Box
                      as="img"
                      src={image}
                      alt={`Property image ${index + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/1200x800/e2e8f0/64748b?text=Image+Not+Available';
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PropertyImageLightbox;

