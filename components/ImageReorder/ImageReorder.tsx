import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Image,
  IconButton,
  SimpleGrid,
  Text,
  Badge,
  Flex,
  VStack,
} from '@chakra-ui/react';
import { FiX, FiMove, FiStar } from 'react-icons/fi';

interface ImageReorderProps {
  images: (File | string)[];
  onRemove: (index: number) => void;
  onReorder: (newOrder: (File | string)[]) => void;
  isExisting?: boolean; // If true, images are URLs (strings), if false, they are Files
}

const ImageReorder: React.FC<ImageReorderProps> = ({
  images,
  onRemove,
  onReorder,
  isExisting = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Create object URLs for File objects and clean them up
  const imageUrls = useMemo(() => {
    if (isExisting) {
      return images.map((img) => {
        const url = img as string;
        return !url || url.trim() === ''
          ? 'https://placehold.co/200x150/e2e8f0/64748b?text=No+Image'
          : url;
      });
    }
    return images.map((img) => URL.createObjectURL(img as File));
  }, [images, isExisting]);

  // Cleanup object URLs on unmount or when images change
  useEffect(() => {
    if (!isExisting) {
      const urls = imageUrls;
      return () => {
        urls.forEach((url) => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }
  }, [imageUrls, isExisting]);

  const getImageSrc = (index: number): string => {
    return imageUrls[index] || 'https://placehold.co/200x150/e2e8f0/64748b?text=No+Image';
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, removed);

    onReorder(newImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <VStack spacing={4} align="stretch">
      <Flex align="center" justify="space-between">
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {images.length} image{images.length !== 1 ? 's' : ''} • Drag to reorder
        </Text>
        <Badge colorScheme="blue" fontSize="xs">
          First image is thumbnail
        </Badge>
      </Flex>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {images.map((image, index) => (
          <Box
            key={index}
            position="relative"
            border="2px solid"
            borderColor={
              index === 0
                ? 'blue.500'
                : dragOverIndex === index
                ? 'green.400'
                : draggedIndex === index
                ? 'gray.400'
                : 'gray.300'
            }
            borderRadius="0"
            overflow="hidden"
            cursor={draggedIndex === index ? 'grabbing' : 'grab'}
            opacity={draggedIndex === index ? 0.5 : 1}
            transform={dragOverIndex === index ? 'scale(1.05)' : 'scale(1)'}
            transition="all 0.2s"
            bg="white"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            _hover={{
              borderColor: index === 0 ? 'blue.600' : 'gray.400',
              boxShadow: 'md',
            }}
          >
            <Image
              src={getImageSrc(index)}
              alt={`Preview ${index + 1}`}
              width="100%"
              height="200px"
              objectFit="cover"
              pointerEvents="none"
              fallbackSrc="https://placehold.co/200x150/e2e8f0/64748b?text=No+Image"
            />
            
            {/* Thumbnail Badge */}
            {index === 0 && (
              <Box
                position="absolute"
                top={2}
                left={2}
                bg="blue.500"
                color="white"
                px={2}
                py={1}
                borderRadius="sm"
                fontSize="xs"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                gap={1}
                zIndex={2}
              >
                <FiStar size={12} />
                Thumbnail
              </Box>
            )}

            {/* Drag Handle */}
            <Box
              position="absolute"
              top={2}
              right={index === 0 ? '40px' : 2}
              bg="rgba(0, 0, 0, 0.6)"
              color="white"
              p={1}
              borderRadius="sm"
              cursor="grab"
              _active={{ cursor: 'grabbing' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={2}
              title="Drag to reorder"
            >
              <FiMove size={16} />
            </Box>

            {/* Remove Button */}
            <IconButton
              aria-label="Remove image"
              icon={<FiX />}
              size="sm"
              position="absolute"
              bottom={2}
              right={2}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              bg="red.600"
              color="white"
              borderRadius="0"
              _hover={{
                bg: 'red.700',
              }}
              zIndex={2}
            />
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default ImageReorder;
