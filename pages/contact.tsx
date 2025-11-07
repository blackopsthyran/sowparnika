import ContactForm from '@/features/common/modules/ContactForm';
import TextContentBox from '@/features/common/modules/TextContentBox';
import DefaultLayout from '@/features/Layout/DefaultLayout';
import { Box, Grid, GridItem, Text, VStack, HStack, Icon, Link } from '@chakra-ui/react';
import { FiPhone, FiMapPin } from 'react-icons/fi';
import React from 'react';

const Contact = () => {
  return (
    <DefaultLayout
      title="Contact Us - Sowparnika Properties"
      description="Contact Sowparnika Properties in Kakkanad, Kochi. Get in touch with our real estate experts for property inquiries, consultations, and more."
    >
      <Box
        backgroundColor="#f7f8f9"
        paddingY="3rem"
        paddingX={{ base: '1rem', md: '3rem' }}
      >
        <Grid
          templateColumns="repeat(6, 1fr)"
          gap="5"
          maxWidth="1280px"
          margin="0 auto"
        >
          <GridItem colSpan={{ base: 6, md: 4 }}>
            <TextContentBox title="Contact Us">
              <ContactForm />
            </TextContentBox>
          </GridItem>
          <GridItem colSpan={{ base: 6, md: 2 }}>
            <TextContentBox title="Get In Touch">
              <VStack spacing={6} align="stretch">
                {/* Address */}
                <Box>
                  <HStack spacing={3} mb={2}>
                    <Icon as={FiMapPin} color="blue.600" fontSize="xl" />
                    <Text fontWeight="600" fontSize="md" color="gray.800">
                      Address
                    </Text>
                  </HStack>
                  <Text
                    fontWeight="light"
                    color="gray.600"
                    fontSize="1rem"
                    lineHeight="tall"
                    pl={9}
                  >
                    Door No: 6 / 754 H, Vallathol Junction,<br />
                    Seaport - Airport Rd, Kakkanad,<br />
                    Kochi, Kerala 682021
                  </Text>
                </Box>

                {/* Phone */}
                <Box>
                  <HStack spacing={3} mb={2}>
                    <Icon as={FiPhone} color="blue.600" fontSize="xl" />
                    <Text fontWeight="600" fontSize="md" color="gray.800">
                      Call Us
                    </Text>
                  </HStack>
                  <Link
                    href="tel:9446211417"
                    fontWeight="light"
                    color="blue.600"
                    fontSize="1.2rem"
                    pl={9}
                    _hover={{ color: 'blue.700', textDecoration: 'underline' }}
                  >
                    +91 9446211417
                  </Link>
                </Box>
              </VStack>
            </TextContentBox>
          </GridItem>
        </Grid>
      </Box>
    </DefaultLayout>
  );
};

export default Contact;
