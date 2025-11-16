import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';

type ContactFormType = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

const ContactForm = () => {
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormType>();

  // Get reCAPTCHA site key from environment variable
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const onSubmit = (data: ContactFormType) => {
    // Validate captcha
    if (!recaptchaValue) {
      toast({
        title: 'Verification required',
        description: 'Please complete the reCAPTCHA verification.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Format message for WhatsApp
    const whatsappMessage = `*New Contact Form Inquiry*\n\n` +
      `*Name:* ${data.name}\n` +
      `*Email:* ${data.email}\n` +
      (data.phone ? `*Phone:* ${data.phone}\n` : '') +
      `*Message:* ${data.message}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/919446211417?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    toast({
      title: 'Redirecting to WhatsApp',
      description: 'Opening WhatsApp to send your message...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Reset form
    reset();
    setRecaptchaValue(null);
    recaptchaRef.current?.reset();
  };

  return (
    <Box
      width="100%"
      borderRadius="sm"
      backgroundColor="white"
      color="gray.700"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <Input
            marginTop="1.3rem"
            id="name"
            type="text"
            placeholder="Name"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email} isRequired>
          <Input
            marginTop="1.3rem"
            id="email"
            type="email"
            placeholder="Email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
          />
          <FormErrorMessage>
            {errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.phone}>
          <Input
            marginTop="1.3rem"
            id="phone"
            type="tel"
            placeholder="Phone (optional)"
            {...register('phone', {
              pattern: {
                value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                message: 'Please enter a valid phone number',
              },
            })}
          />
          <FormErrorMessage>
            {errors.phone && errors.phone.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.message} isRequired>
          <Textarea
            marginTop="1.3rem"
            id="message"
            placeholder="Message"
            {...register('message', {
              required: 'Message is required',
              minLength: {
                value: 10,
                message: 'Message must be at least 10 characters',
              },
            })}
          />
          <FormErrorMessage>
            {errors.message && errors.message.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isRequired marginTop="1.3rem">
          <Box>
            {recaptchaSiteKey ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                onChange={(value) => setRecaptchaValue(value)}
                onExpired={() => setRecaptchaValue(null)}
                onError={() => setRecaptchaValue(null)}
              />
            ) : (
              <Text fontSize="sm" color="red.500">
                reCAPTCHA site key not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment variables.
              </Text>
            )}
          </Box>
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          display="flex"
          fontSize="base"
          padding="1.6rem"
          marginTop="4rem"
          marginLeft="auto"
          isDisabled={!recaptchaValue}
        >
          Send Message
        </Button>
      </form>
    </Box>
  );
};

export default ContactForm;
