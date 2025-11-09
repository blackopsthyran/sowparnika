/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper';
import { Box } from '@chakra-ui/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { Divider } from '@chakra-ui/react';

const PropertyThumbnailSlider = ({ photos }: { photos: string[] }) => {
  const [thumbsSwiper, setThumbsSlider] = useState<any>(null);
  
  // Fix broken placeholder URLs and filter out invalid ones
  const validPhotos = photos
    .filter((photo) => photo && typeof photo === 'string' && photo.trim() !== '')
    .map((photo) => {
      // Fix broken placeholder URLs
      if (photo.includes('via.placeholder.com')) {
        return 'https://placehold.co/800x600/e2e8f0/64748b?text=Property+Image';
      }
      return photo;
    });

  // If no valid photos, use placeholder
  const displayPhotos = validPhotos.length > 0 ? validPhotos : ['https://placehold.co/800x600/e2e8f0/64748b?text=No+Image'];

  return (
    <Box>
      <Box
        sx={{
          '.mySwiper2': {
            height: '500px',
            width: '100%',
            '& .swiper-slide': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              },
            },
          },
          '.mySwiper': {
            height: '100px',
            boxSizing: 'border-box',
            padding: '10px 0',
            '& .swiper-slide': {
              width: '25%',
              height: '100%',
              opacity: 0.4,
              cursor: 'pointer',
              '&.swiper-slide-thumb-active': {
                opacity: 1,
              },
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              },
            },
          },
        }}
      >
        <Swiper
          loop={displayPhotos.length > 1}
          navigation={true}
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper2"
        >
          {displayPhotos.map((photo: string, index: number) => (
            <SwiperSlide key={`${photo}-${index}`}>
            <img 
              src={photo} 
              alt={`Property image ${index + 1}`}
              crossOrigin="anonymous"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Image+Error';
              }}
            />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
      <Divider marginY="1rem" />
      <Swiper
        onSwiper={setThumbsSlider}
        loop={displayPhotos.length > 1}
        spaceBetween={10}
        slidesPerView={Math.min(5, displayPhotos.length)}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper"
      >
        {displayPhotos.map((photo: string, index: number) => (
          <SwiperSlide key={`thumb-${photo}-${index}`}>
            <img 
              src={photo} 
              alt={`Thumbnail ${index + 1}`}
              crossOrigin="anonymous"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                console.error('Thumbnail failed to load:', photo);
                (e.target as HTMLImageElement).src = 'https://placehold.co/200x150/e2e8f0/64748b?text=Error';
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default PropertyThumbnailSlider;
