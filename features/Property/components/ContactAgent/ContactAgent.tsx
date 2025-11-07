import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';

interface ContactAgentProps {
  propertyTitle: string;
}

const ContactAgent: React.FC<ContactAgentProps> = ({ propertyTitle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Please contact me regarding ${propertyTitle}`,
  });
  const [showPhone, setShowPhone] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    toast({
      title: 'Message sent',
      description: 'The agent will contact you soon.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: `Please contact me regarding ${propertyTitle}`,
    });
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={6}
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack spacing={6} align="stretch">
        {/* Agent Profile */}
        <HStack spacing={4}>
          <Avatar
            size="lg"
            name="Property Agent"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
          />
          <Box>
            <Text fontWeight="600" fontSize="lg">
              Property Agent
            </Text>
            <Text fontSize="sm" color="gray.600">
              Sowparnika Properties
            </Text>
          </Box>
        </HStack>

        {/* Phone Number */}
        <Box>
          {showPhone ? (
            <HStack>
              <IconButton
                aria-label="Phone"
                icon={<FiPhone />}
                size="sm"
                variant="ghost"
              />
              <Text fontSize="lg" fontWeight="500">
                +1 (555) 123-4567
              </Text>
            </HStack>
          ) : (
            <Button
              leftIcon={<FiPhone />}
              variant="link"
              colorScheme="blue"
              size="sm"
              onClick={() => setShowPhone(true)}
            >
              Show phone number
            </Button>
          )}
        </Box>

        {/* Contact Form */}
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="500">
                Name
              </FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                size="md"
                borderRadius="md"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="500">
                Email
              </FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                size="md"
                borderRadius="md"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="500">
                Phone (optional)
              </FormLabel>
              <HStack>
                <Box
                  as="select"
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                  px={3}
                  py={2}
                  fontSize="sm"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </Box>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  size="md"
                  borderRadius="md"
                  flex={1}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="500">
                Message
              </FormLabel>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Your message"
                size="md"
                borderRadius="md"
                rows={4}
                resize="vertical"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              width="full"
              borderRadius="md"
              fontWeight="600"
            >
              Contact Agent
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ContactAgent;

