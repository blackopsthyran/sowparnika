import React from 'react';
import { Box, Container, VStack, Heading, Text, SimpleGrid, Icon, Flex } from '@chakra-ui/react';
import { FiShield, FiUsers, FiHome, FiCheckCircle } from 'react-icons/fi';
import DefaultLayout from '@/features/Layout/DefaultLayout';

const About = () => {
  const features = [
    {
      icon: FiShield,
      title: 'Verified Properties',
      description: 'Every property is thoroughly verified for documents and legality, ensuring peace of mind.',
    },
    {
      icon: FiUsers,
      title: 'Expert Team',
      description: 'Our dedicated team of real estate professionals and consultants guide you through every step.',
    },
    {
      icon: FiHome,
      title: 'Local Expertise',
      description: 'Deep knowledge of Kakkanad and Kochi real estate market with global service standards.',
    },
    {
      icon: FiCheckCircle,
      title: 'Full-Service Support',
      description: 'From consultation to registration, we support you through the entire property journey.',
    },
  ];

  return (
    <DefaultLayout
      title="About Us - Sowparnika Properties"
      description="Learn about Sowparnika Properties - your trusted real estate partner in Kakkanad, Kochi. We offer verified properties, expert consultation, and full-service support."
    >
      <Box bg="gray.50" minH="100vh" pt={{ base: '100px', md: '120px' }} pb={20}>
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">
            {/* Hero Section */}
            <Box textAlign="center" py={10}>
              <Heading
                as="h1"
                size="2xl"
                mb={4}
                fontFamily="'Playfair Display', serif"
                color="blue.900"
              >
                About Our Company
              </Heading>
              <Box maxW="800px" mx="auto">
                <Text fontSize="lg" color="gray.600" lineHeight="tall">
                  Welcome to <strong>Sowparnika Properties</strong> – a name you can trust in the real estate landscape of Kakkanad, Kochi.
                </Text>
              </Box>
            </Box>

            {/* Main Content */}
            <Box bg="white" borderRadius="xl" p={{ base: 6, md: 10 }} boxShadow="lg">
              <VStack spacing={6} align="stretch">
                <Text fontSize="lg" color="gray.700" lineHeight="tall">
                  We are more than just a property listing platform. We are a dedicated team of real estate professionals, consultants, and local market experts committed to helping individuals and businesses find the perfect space—whether it's a dream home, a smart investment, or a commercial opportunity.
                </Text>

                <Text fontSize="lg" color="gray.700" lineHeight="tall">
                  With Kakkanad rapidly growing as Kochi's IT and residential hub, the demand for quality, well-located, and verified properties is higher than ever. That's where we come in. At <strong>Sowparnika Properties</strong>, we handpick listings, thoroughly verify documents, and ensure that every property showcased on our platform meets high standards of quality and legality.
                </Text>

                <Heading
                  as="h2"
                  size="xl"
                  mt={8}
                  mb={4}
                  fontFamily="'Playfair Display', serif"
                  color="blue.900"
                >
                  What Makes Us Different?
                </Heading>

                <VStack spacing={6} align="stretch" mt={4}>
                  <Box>
                    <Heading as="h3" size="md" mb={2} color="blue.800">
                      Local Knowledge, Global Standards
                    </Heading>
                    <Text color="gray.700" lineHeight="tall">
                      Based in Kakkanad, we combine deep local insights with a professional, client-first approach that matches global real estate service standards.
                    </Text>
                  </Box>

                  <Box>
                    <Heading as="h3" size="md" mb={2} color="blue.800">
                      Full-Service Support
                    </Heading>
                    <Text color="gray.700" lineHeight="tall">
                      From property consultation and site visits to legal paperwork, negotiations, and registration—we support you through every step of the journey.
                    </Text>
                  </Box>

                  <Box>
                    <Heading as="h3" size="md" mb={2} color="blue.800">
                      Reliable Network
                    </Heading>
                    <Text color="gray.700" lineHeight="tall">
                      Our partnerships with builders, developers, legal advisors, and financial institutions ensure you get the best options and smooth service under one roof.
                    </Text>
                  </Box>

                  <Box>
                    <Heading as="h3" size="md" mb={2} color="blue.800">
                      For Everyone
                    </Heading>
                    <Text color="gray.700" lineHeight="tall">
                      Whether you're a first-time buyer, an NRI looking to invest, a landlord seeking tenants, or someone searching for rental options, we cater to all types of clients with equal care.
                    </Text>
                  </Box>
                </VStack>
              </VStack>
            </Box>

            {/* Features Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mt={8}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  boxShadow="md"
                  textAlign="center"
                  _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                  transition="all 0.3s"
                >
                  <Icon as={feature.icon} w={10} h={10} color="blue.600" mb={4} />
                  <Heading as="h3" size="md" mb={2} color="blue.900">
                    {feature.title}
                  </Heading>
                  <Text color="gray.600" fontSize="sm" lineHeight="tall">
                    {feature.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default About;

