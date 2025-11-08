import React from 'react';
import { TbQuote } from 'react-icons/tb';
import { Box, Text } from '@chakra-ui/react';

const TestimonialCard: React.FC<{
  name: string;
  image: string;
  company: string;
  testimonial: string;
}> = ({ name, image, company, testimonial }) => {
  return (
    <Box
      backgroundColor="#ffffff"
      padding="3rem"
      display="flex"
      flexDirection="column"
      marginBottom={{ base: '1rem', sm: '0' }}
      height="100%"
    >
      <Box>
        <TbQuote size={40} color="#1a202c" />
      </Box>
      <Text fontSize="lg" color="gray.700" marginY="1.8rem" lineHeight="1.8" flex="1">
        {testimonial}
      </Text>
      <Box mt="auto">
        <Text fontSize="md" fontWeight="600" color="gray.900" fontFamily="'Playfair Display', serif">
          {name}
        </Text>
        <Text
          fontSize="sm"
          fontStyle="italic"
          fontWeight="400"
          color="gray.600"
          mt={1}
        >
          {company}, Kerala
        </Text>
      </Box>
    </Box>
  );
};

export default TestimonialCard;
