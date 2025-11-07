import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import DefaultLayout from '@/features/Layout/DefaultLayout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      router.push('/cpanel');
    } else {
      setError('Invalid credentials. Only admin can login.');
    }
    
    setIsLoading(false);
  };

  return (
    <DefaultLayout title="Admin Login" description="Admin login page">
      <Container maxW="md" py="8rem">
        <Box
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          backgroundColor="white"
        >
          <VStack spacing={6}>
            <Heading size="lg" color="blue.600">
              Admin Login
            </Heading>
            <Text color="gray.600">
              Please login to access the admin panel
            </Text>

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                >
                  Login
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </DefaultLayout>
  );
};

export default LoginPage;

