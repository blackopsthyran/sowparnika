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
      <Box bg="white" minH="100vh" display="flex" alignItems="center" justifyContent="center" py={16}>
        <Container maxW="md">
          <Box
            p={12}
            borderWidth="2px"
            borderColor="gray.900"
            borderRadius="0"
            backgroundColor="white"
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                border: '1px solid',
                borderColor: 'gray.300',
                zIndex: -1,
              },
            }}
          >
            <VStack spacing={8} align="stretch">
              <Box textAlign="center">
                <Heading 
                  size="xl" 
                  color="gray.900"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  mb={2}
                >
                  Admin Login
                </Heading>
                <Text color="gray.900" fontSize="sm" letterSpacing="0.1em">
                  Access the control panel
                </Text>
              </Box>

              {error && (
                <Alert status="error" borderRadius="0" border="1px solid" borderColor="red.500">
                  <AlertIcon />
                  <Text color="gray.900">{error}</Text>
                </Alert>
              )}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                      Email
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      bg="white"
                      borderColor="gray.300"
                      color="gray.900"
                      _placeholder={{ color: 'gray.400' }}
                      _focus={{
                        borderColor: 'gray.900',
                        boxShadow: '0 0 0 1px gray.900',
                      }}
                      borderRadius="0"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.900" fontWeight="600" fontSize="sm" letterSpacing="0.05em" textTransform="uppercase">
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      bg="white"
                      borderColor="gray.300"
                      color="gray.900"
                      _placeholder={{ color: 'gray.400' }}
                      _focus={{
                        borderColor: 'gray.900',
                        boxShadow: '0 0 0 1px gray.900',
                      }}
                      borderRadius="0"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    width="full"
                    isLoading={isLoading}
                    loadingText="Logging in..."
                    bg="gray.900"
                    color="white"
                    borderRadius="0"
                    fontWeight="600"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    _hover={{
                      bg: 'gray.800',
                    }}
                    py={6}
                  >
                    Login
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </Container>
      </Box>
    </DefaultLayout>
  );
};

export default LoginPage;

