import React, { useState } from 'react';
import { Box, IconButton, Button, Grid, GridItem } from '@chakra-ui/react';
import { FiShare2, FiHeart, FiGrid } from 'react-icons/fi';
import { useRouter } from 'next/router';
import PropertyImageLightbox from '@/features/Property/components/PropertyImageLightbox/PropertyImageLightbox';

interface PropertyImageGalleryProps {
  photos: string[];
  propertyId: string;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ photos, propertyId }) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const validPhotos = photos
    .filter((photo) => photo && typeof photo === 'string' && photo.trim() !== '')
    .map((photo) => {
      if (photo.includes('via.placeholder.com')) {
        return 'https://placehold.co/800x600/e2e8f0/64748b?text=Property+Image';
      }
      return photo;
    });

  const displayPhotos = validPhotos.length > 0 ? validPhotos : ['https://placehold.co/800x600/e2e8f0/64748b?text=No+Image'];
  const mainImage = displayPhotos[selectedImage] || displayPhotos[0];
  const thumbnailPhotos = displayPhotos.slice(0, 5);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Property Listing',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <Box>
      {/* Lightbox Gallery */}
      <PropertyImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={displayPhotos}
        initialIndex={lightboxIndex}
      />
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={2} mb={4}>
        {/* Main Image */}
        <GridItem>
          <Box
            position="relative"
            width="100%"
            height={{ base: '300px', md: '500px' }}
            borderRadius="lg"
            overflow="hidden"
            bg="gray.200"
            cursor="pointer"
            onClick={() => openLightbox(selectedImage)}
            _hover={{ opacity: 0.95 }}
            transition="opacity 0.2s"
          >
            <Box
              as="img"
              src={mainImage}
              alt="Main property image"
              width="100%"
              height="100%"
              objectFit="cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Image+Error';
              }}
            />
          </Box>
        </GridItem>

        {/* Thumbnail Grid */}
        <GridItem>
          <Grid templateColumns="repeat(2, 1fr)" gap={2} height="100%">
            {thumbnailPhotos.map((photo, index) => (
              <Box
                key={index}
                position="relative"
                width="100%"
                height={{ base: '140px', md: '160px' }}
                borderRadius="lg"
                overflow="hidden"
                bg="gray.200"
                cursor="pointer"
                border={selectedImage === index ? '3px solid' : 'none'}
                borderColor="blue.500"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                  openLightbox(index);
                }}
                _hover={{ opacity: 0.9 }}
              >
                <Box
                  as="img"
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Image';
                  }}
                />
                {/* Overlay buttons for top right images */}
                {index < 2 && (
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    display="flex"
                    gap={2}
                  >
                    {index === 0 && (
                      <IconButton
                        aria-label="Share"
                        icon={<FiShare2 />}
                        size="sm"
                        bg="white"
                        color="gray.700"
                        borderRadius="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare();
                        }}
                        _hover={{ bg: 'gray.100' }}
                      />
                    )}
                    <IconButton
                      aria-label="Save"
                      icon={<FiHeart />}
                      size="sm"
                      bg="white"
                      color={isSaved ? 'red.500' : 'gray.700'}
                      borderRadius="full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSaved(!isSaved);
                      }}
                      _hover={{ bg: 'gray.100' }}
                    />
                  </Box>
                )}
                {/* Show all photos button on last thumbnail */}
                {index === thumbnailPhotos.length - 1 && displayPhotos.length > 5 && (
                  <Box
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.600"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(thumbnailPhotos.length - 1);
                    }}
                  >
                    <Button
                      leftIcon={<FiGrid />}
                      colorScheme="whiteAlpha"
                      variant="solid"
                      size="sm"
                    >
                      Show all photos
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Grid>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default PropertyImageGallery;

