import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Container, SimpleGrid, Card, CardBody, Heading, Text, Button, VStack, HStack, Icon, Stat, StatLabel, StatNumber, StatHelpText, Flex } from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaCog, FaChartBar } from 'react-icons/fa';
import { FiHome } from 'react-icons/fi';
import Link from 'next/link';
import DefaultLayout from '@/features/Layout/DefaultLayout';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    rented: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/get-properties?limit=1000');
      const data = await response.json();
      if (response.ok && data.properties) {
        const properties = data.properties;
        setStats({
          total: properties.length,
          active: properties.filter((p: any) => p.status === 'active').length,
          sold: properties.filter((p: any) => p.status === 'sold').length,
          rented: properties.filter((p: any) => p.status === 'rented').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      border="2px solid"
      borderColor="gray.900"
      borderRadius="0"
      bg="white"
      p={8}
    >
      <Heading 
        size="md" 
        mb={6}
        color="gray.900"
        fontFamily="'Playfair Display', serif"
        fontWeight="700"
        letterSpacing="0.05em"
        textTransform="uppercase"
      >
        Quick Stats
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        <Box>
          <Text 
            fontSize="xs" 
            color="gray.900" 
            fontWeight="600" 
            letterSpacing="0.1em" 
            textTransform="uppercase"
            mb={2}
          >
            Total Properties
          </Text>
          <Text 
            fontSize="3xl" 
            color="gray.900" 
            fontWeight="700"
            fontFamily="'Playfair Display', serif"
            mb={1}
          >
            {loading ? '...' : stats.total}
          </Text>
          <Text fontSize="xs" color="gray.900" letterSpacing="0.05em">
            All listings
          </Text>
        </Box>
        <Box>
          <Text 
            fontSize="xs" 
            color="gray.900" 
            fontWeight="600" 
            letterSpacing="0.1em" 
            textTransform="uppercase"
            mb={2}
          >
            Active Listings
          </Text>
          <Text 
            fontSize="3xl" 
            color="gray.900" 
            fontWeight="700"
            fontFamily="'Playfair Display', serif"
            mb={1}
          >
            {loading ? '...' : stats.active}
          </Text>
          <Text fontSize="xs" color="gray.900" letterSpacing="0.05em">
            Currently available
          </Text>
        </Box>
        <Box>
          <Text 
            fontSize="xs" 
            color="gray.900" 
            fontWeight="600" 
            letterSpacing="0.1em" 
            textTransform="uppercase"
            mb={2}
          >
            Sold/Rented
          </Text>
          <Text 
            fontSize="3xl" 
            color="gray.900" 
            fontWeight="700"
            fontFamily="'Playfair Display', serif"
            mb={1}
          >
            {loading ? '...' : stats.sold + stats.rented}
          </Text>
          <Text fontSize="xs" color="gray.900" letterSpacing="0.05em">
            Completed transactions
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

const CpanelDashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <DefaultLayout title="Loading..." description="Loading control panel">
        <Box p={8} textAlign="center">Loading...</Box>
      </DefaultLayout>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Overview and statistics',
      icon: FaChartBar,
      link: '/cpanel',
      color: 'blue',
    },
    {
      title: 'Create Listing',
      description: 'Add a new property listing',
      icon: FaPlus,
      link: '/cpanel/create-listing',
      color: 'green',
    },
    {
      title: 'Manage Listings',
      description: 'Edit, update, or delete properties',
      icon: FaEdit,
      link: '/cpanel/listings',
      color: 'purple',
    },
    {
      title: 'Settings',
      description: 'Configure your website settings',
      icon: FaCog,
      link: '/cpanel/settings',
      color: 'orange',
    },
  ];

  return (
    <DefaultLayout title="Control Panel" description="Admin control panel">
      <Box bg="white" minH="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={10} align="stretch">
            <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
              <Box>
                <Heading 
                  size="xl" 
                  mb={3} 
                  color="gray.900"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                >
                  Control Panel
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Manage your real estate website
                </Text>
              </Box>
              <Link href="/">
                <Button
                  leftIcon={<FiHome />}
                  variant="outline"
                  borderColor="gray.900"
                  color="gray.900"
                  borderRadius="0"
                  _hover={{
                    bg: 'gray.900',
                    color: 'white',
                  }}
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                >
                  Go to Home
                </Button>
              </Link>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {menuItems.map((item) => (
                <Link key={item.link} href={item.link}>
                  <Box
                    as="a"
                    cursor="pointer"
                    border="2px solid"
                    borderColor="gray.900"
                    borderRadius="0"
                    bg="white"
                    p={6}
                    height="100%"
                    transition="all 0.2s"
                    _hover={{ 
                      transform: 'translateY(-4px)',
                      bg: 'gray.50',
                    }}
                    display="flex"
                    flexDirection="column"
                  >
                    <VStack spacing={4} align="stretch" height="100%">
                      <Icon as={item.icon} boxSize={10} color="gray.900" />
                      <Box>
                        <Heading size="md" mb={2} color="gray.900" fontFamily="'Playfair Display', serif" fontWeight="700">
                          {item.title}
                        </Heading>
                        <Text fontSize="sm" color="gray.900" fontFamily="'Playfair Display', serif">
                          {item.description}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>

            <DashboardStats />
          </VStack>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default CpanelDashboard;

