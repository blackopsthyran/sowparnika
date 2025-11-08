import { partners } from '@/features/Home/components/Partners/PartnersConst';
import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';

const Partners = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Split partners into two groups for two marquees
  const firstRow = partners.slice(0, Math.ceil(partners.length / 2));
  const secondRow = partners.slice(Math.ceil(partners.length / 2));

  // Create circular linked list effect: duplicate multiple times for seamless infinite scroll
  // Each duplicate set represents one "cycle" - when one completes, the next identical cycle is ready
  const createCircularList = (items: string[], cycles: number = 3) => {
    const circular: string[] = [];
    for (let i = 0; i < cycles; i++) {
      circular.push(...items);
    }
    return circular;
  };

  const circularFirstRow = createCircularList(firstRow, 3);
  const circularSecondRow = createCircularList(secondRow, 3);

  return (
    <Box
      bg="white"
      py={3}
      overflow="hidden"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor="gray.200"
      position="relative"
    >
      <VStack spacing={0}>
        {/* First Marquee - Moving Left */}
        <Box
          position="relative"
          width="100%"
          overflow="hidden"
          py={2}
        >
          {!mounted ? (
            <HStack spacing={10} px={6} flexWrap="nowrap">
              {firstRow.map((partner, index) => (
                <Text
                  key={`${partner}-${index}`}
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight="600"
                  color="gray.600"
                  whiteSpace="nowrap"
                  fontFamily="'Playfair Display', serif"
                  opacity={0.7}
                  flexShrink={0}
                >
                  {partner}
                </Text>
              ))}
            </HStack>
          ) : (
            <Box
              display="flex"
              width="max-content"
              sx={{
                willChange: 'transform',
              }}
              style={{
                animation: 'partners-marquee-left 50s linear infinite',
              }}
            >
              <HStack spacing={10} px={6} minW="max-content" flexWrap="nowrap" display="flex">
                {circularFirstRow.map((partner, index) => (
                  <Text
                    key={`left-${partner}-${index}`}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight="600"
                    color="gray.600"
                    whiteSpace="nowrap"
                    fontFamily="'Playfair Display', serif"
                    opacity={0.7}
                    flexShrink={0}
                  >
                    {partner}
                  </Text>
                ))}
              </HStack>
            </Box>
          )}
        </Box>

        {/* Second Marquee - Moving Right */}
        <Box
          position="relative"
          width="100%"
          overflow="hidden"
          py={2}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          {!mounted ? (
            <HStack spacing={10} px={6} flexWrap="nowrap">
              {secondRow.map((partner, index) => (
                <Text
                  key={`${partner}-${index}`}
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight="600"
                  color="gray.600"
                  whiteSpace="nowrap"
                  fontFamily="'Playfair Display', serif"
                  opacity={0.7}
                  flexShrink={0}
                >
                  {partner}
                </Text>
              ))}
            </HStack>
          ) : (
            <Box
              display="flex"
              width="max-content"
              sx={{
                willChange: 'transform',
              }}
              style={{
                animation: 'partners-marquee-right 50s linear infinite',
              }}
            >
              <HStack spacing={10} px={6} minW="max-content" flexWrap="nowrap" display="flex">
                {circularSecondRow.map((partner, index) => (
                  <Text
                    key={`right-${partner}-${index}`}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight="600"
                    color="gray.600"
                    whiteSpace="nowrap"
                    fontFamily="'Playfair Display', serif"
                    opacity={0.7}
                    flexShrink={0}
                  >
                    {partner}
                  </Text>
                ))}
              </HStack>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default Partners;
