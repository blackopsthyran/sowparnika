import React from 'react';
import { HStack, Box, Text, VStack } from '@chakra-ui/react';
import { FiCamera, FiHome, FiMapPin } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';

interface PropertyThumbnailNavProps {
  photos: string[];
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const PropertyThumbnailNav: React.FC<PropertyThumbnailNavProps> = ({
  photos,
  onTabChange,
  activeTab,
}) => {
  const tabs = [
    { id: 'photos', label: 'Photos', icon: FiCamera, count: photos.length },
    { id: 'floorplan', label: 'Floor Plan', icon: HiOutlineDocumentText },
    { id: 'exterior', label: 'Exterior', icon: FiHome },
    { id: 'other', label: 'Other', icon: FiMapPin },
  ];

  return (
    <HStack spacing={4} mt={6} borderTop="1px solid" borderColor="gray.200" pt={4}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const firstPhoto = photos[0] || 'https://placehold.co/200x150/e2e8f0/64748b?text=Image';

        return (
          <VStack
            key={tab.id}
            spacing={2}
            cursor="pointer"
            onClick={() => onTabChange(tab.id)}
            opacity={isActive ? 1 : 0.6}
            _hover={{ opacity: 1 }}
            transition="opacity 0.2s"
            flex={1}
            maxW="120px"
          >
            <Box
              width="100%"
              height="80px"
              borderRadius="md"
              overflow="hidden"
              bg="gray.200"
              border={isActive ? '2px solid' : '1px solid'}
              borderColor={isActive ? 'blue.500' : 'gray.300'}
            >
              <Box
                as="img"
                src={firstPhoto}
                alt={tab.label}
                width="100%"
                height="100%"
                objectFit="cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/200x150/e2e8f0/64748b?text=Image';
                }}
              />
            </Box>
            <HStack spacing={1}>
              <Icon size={16} />
              <Text fontSize="xs" fontWeight="500" textAlign="center">
                {tab.label}
                {tab.count && ` (${tab.count})`}
              </Text>
            </HStack>
          </VStack>
        );
      })}
    </HStack>
  );
};

export default PropertyThumbnailNav;

