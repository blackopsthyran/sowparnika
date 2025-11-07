import React, { useState, useEffect } from 'react';
import { Box, Text, HStack } from '@chakra-ui/react';

interface MarqueeProps {
  items: string[];
  speed?: number;
  direction?: 'left' | 'right';
}

const Marquee: React.FC<MarqueeProps> = ({ 
  items, 
  speed = 40,
  direction = 'left' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  if (!mounted) {
    return (
      <Box
        position="relative"
        width="100%"
        overflow="hidden"
        bg="rgba(0, 0, 0, 0.03)"
        py={5}
        borderY="1px solid"
        borderColor="gray.200"
      >
        <HStack spacing={16} px={8}>
          {items.slice(0, 6).map((item, index) => (
            <Text
              key={`${item}-${index}`}
              fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
              fontWeight="500"
              color="gray.700"
              whiteSpace="nowrap"
              textTransform="uppercase"
              letterSpacing="0.15em"
              fontFamily="'Playfair Display', serif"
              opacity={0.8}
            >
              {item}
            </Text>
          ))}
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      width="100%"
      overflow="hidden"
      bg="rgba(0, 0, 0, 0.03)"
      py={5}
      borderY="1px solid"
      borderColor="gray.200"
    >
      <Box
        display="flex"
        width="max-content"
        sx={{
          '@keyframes marquee-left': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: 'translateX(-50%)',
            },
          },
          '@keyframes marquee-right': {
            '0%': {
              transform: 'translateX(-50%)',
            },
            '100%': {
              transform: 'translateX(0)',
            },
          },
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        <HStack spacing={16} px={8} minW="max-content">
          {duplicatedItems.map((item, index) => (
            <Text
              key={`${item}-${index}`}
              fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
              fontWeight="500"
              color="gray.700"
              whiteSpace="nowrap"
              textTransform="uppercase"
              letterSpacing="0.15em"
              fontFamily="'Playfair Display', serif"
              opacity={0.8}
            >
              {item}
            </Text>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default Marquee;

