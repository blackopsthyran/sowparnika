import TestimonialCard from '@/features/Home/components/Testimonials/components/TestimonialCard';
import { testimonials } from '@/features/Home/components/Testimonials/testomonialConst';
import { Box, Text, HStack } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import RetroGrid from '@/components/RetroGrid';

const Testimonials = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <Box 
      position="relative"
      backgroundColor="gray.50"
      overflow="hidden"
      minH="500px"
    >
      <RetroGrid angle={65} />
      <Box
        position="relative"
        zIndex={1}
        width="100%"
        paddingY={{ base: '3rem', sm: '6rem' }}
      >
        <Text
          fontSize={{ base: '4xl', sm: '5xl' }}
          lineHeight="shorter"
          fontWeight="light"
          paddingX="2rem"
          textAlign="center"
          position="relative"
          zIndex={2}
          mb={4}
        >
          Testimonials
        </Text>
        <Text
          fontSize="2xl"
          fontWeight="light"
          marginTop="1rem"
          marginBottom="3rem"
          paddingX="2rem"
          textAlign="center"
          position="relative"
          zIndex={2}
        >
          Here`s what our valued clients have to say
        </Text>

        {/* Horizontal Marquee Carousel */}
        <Box
          position="relative"
          width="100%"
          overflow="hidden"
          zIndex={2}
          py={4}
        >
          {!mounted ? (
            <HStack spacing={6} px={6} overflowX="auto">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <Box key={`${testimonial.name}-${index}`} minW="400px" flexShrink={0}>
                  <TestimonialCard {...testimonial} />
                </Box>
              ))}
            </HStack>
          ) : (
            <Box
              display="flex"
              width="max-content"
              style={{
                animation: 'testimonial-marquee 60s linear infinite',
              }}
            >
              <HStack spacing={6} px={6} minW="max-content" alignItems="stretch">
                {duplicatedTestimonials.map((testimonial, index) => (
                  <Box 
                    key={`${testimonial.name}-${index}`} 
                    minW={{ base: '320px', md: '380px', lg: '420px' }}
                    maxW={{ base: '320px', md: '380px', lg: '420px' }}
                    flexShrink={0}
                  >
                    <TestimonialCard {...testimonial} />
                  </Box>
                ))}
              </HStack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Testimonials;
