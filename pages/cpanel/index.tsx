import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Container, SimpleGrid, Card, CardBody, Heading, Text, Button, VStack, HStack, Icon, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { FaHome, FaPlus, FaEdit, FaTrash, FaCog, FaChartBar } from 'react-icons/fa';
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
    <Card>
      <CardBody>
        <Heading size="md" mb={4}>Quick Stats</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat>
            <StatLabel>Total Properties</StatLabel>
            <StatNumber>{loading ? '...' : stats.total}</StatNumber>
            <StatHelpText>All listings</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Active Listings</StatLabel>
            <StatNumber>{loading ? '...' : stats.active}</StatNumber>
            <StatHelpText>Currently available</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Sold/Rented</StatLabel>
            <StatNumber>{loading ? '...' : stats.sold + stats.rented}</StatNumber>
            <StatHelpText>Completed transactions</StatHelpText>
          </Stat>
        </SimpleGrid>
      </CardBody>
    </Card>
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
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading size="xl" mb={2} color="blue.700">
                Control Panel
              </Heading>
              <Text color="gray.600">Manage your real estate website</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {menuItems.map((item) => (
                <Link key={item.link} href={item.link}>
                  <Card
                    as="a"
                    cursor="pointer"
                    _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                    transition="all 0.2s"
                    height="100%"
                  >
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Icon as={item.icon} boxSize={10} color={`${item.color}.500`} />
                        <Box>
                          <Heading size="md" mb={2} color="gray.800">
                            {item.title}
                          </Heading>
                          <Text fontSize="sm" color="gray.600">
                            {item.description}
                          </Text>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
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

