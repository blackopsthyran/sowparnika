import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Icon, Flex, Input, IconButton, HStack, VStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react';
import { FiDollarSign, FiX } from 'react-icons/fi';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface PriceRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  maxW?: string | object;
}

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  value,
  onChange,
  maxW = '180px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sliderValue, setSliderValue] = useState([0, 10000000]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const [min, max] = value.split('-').map(Number);
      if (!isNaN(min)) setMinPrice(min.toLocaleString());
      if (!isNaN(max)) setMaxPrice(max.toLocaleString());
      setSliderValue([min || 0, max || 10000000]);
    }
  }, [value]);


  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, '');
    if (val === '' || /^\d+$/.test(val)) {
      setMinPrice(val === '' ? '' : Number(val).toLocaleString());
      const numVal = val === '' ? 0 : Number(val);
      setSliderValue([numVal, sliderValue[1]]);
      onChange(`${numVal}-${sliderValue[1]}`);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, '');
    if (val === '' || /^\d+$/.test(val)) {
      setMaxPrice(val === '' ? '' : Number(val).toLocaleString());
      const numVal = val === '' ? 10000000 : Number(val);
      setSliderValue([sliderValue[0], numVal]);
      onChange(`${sliderValue[0]}-${numVal}`);
    }
  };

  const clearMin = () => {
    setMinPrice('');
    setSliderValue([0, sliderValue[1]]);
    onChange(`0-${sliderValue[1]}`);
  };

  const clearMax = () => {
    setMaxPrice('');
    setSliderValue([sliderValue[0], 10000000]);
    onChange(`${sliderValue[0]}-10000000`);
  };

  const displayText = value && value !== '0-10000000' 
    ? `${minPrice || 'No Min'} - ${maxPrice || 'No Max'}`
    : 'Any price';

  return (
    <Box position="relative" maxW={maxW} w="full" ref={dropdownRef}>
      <Box
        as="button"
        type="button"
        w="full"
        px={4}
        py={3}
        bg="rgba(250, 248, 245, 0.95)"
        backdropFilter="blur(24px) saturate(200%)"
        border="1px solid rgba(220, 215, 210, 0.6)"
        borderRadius="lg"
        cursor="pointer"
        transition="all 0.2s ease"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        _hover={{
          bg: 'rgba(250, 248, 245, 1)',
          borderColor: 'rgba(220, 215, 210, 0.8)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        _active={{
          transform: 'scale(0.98)',
        }}
        onClick={() => setIsOpen(!isOpen)}
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Flex align="center" gap={2} flex={1}>
          <Text
            fontSize={{ base: '12px', md: '15px' }}
            fontWeight="500"
            color={value && value !== '0-10000000' ? 'gray.900' : 'gray.500'}
            noOfLines={1}
            fontFamily="'Playfair Display', serif"
            letterSpacing="0.01em"
          >
            {displayText}
          </Text>
        </Flex>
        <Icon
          as={ChevronDownIcon}
          w={4}
          h={4}
          color="gray.600"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        />
      </Box>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.300"
            zIndex={9998}
            display={{ base: 'block', md: 'none' }}
            onClick={() => setIsOpen(false)}
          />
          <Box
            position={{ base: 'fixed', md: 'absolute' }}
            top={{ base: 'auto', md: '100%' }}
            bottom={{ base: '20px', md: 'auto' }}
            left={{ base: '50%', md: 0 }}
            right={{ base: 'auto', md: 0 }}
            transform={{ base: 'translateX(-50%)', md: 'none' }}
            mt={{ base: 0, md: 2 }}
            bg="white"
            border="1px solid rgba(0, 0, 0, 0.1)"
            borderRadius="lg"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.15)"
            zIndex={9999}
            p={4}
            minW={{ base: '280px', md: '320px' }}
            maxW={{ base: 'calc(100vw - 32px)', md: '400px' }}
            w={{ base: 'auto', md: 'auto' }}
          >
          <VStack spacing={4} align="stretch">
            {/* Min/Max Inputs */}
            <HStack spacing={3}>
              <Box flex={1}>
                <Text fontSize="xs" color="gray.600" mb={1} fontWeight="500">
                  Min Price
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.700">₹</Text>
                  <Input
                    placeholder="No Min"
                    value={minPrice}
                    onChange={handleMinChange}
                    size="sm"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                  />
                  {minPrice && (
                    <IconButton
                      aria-label="Clear min"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      onClick={clearMin}
                    />
                  )}
                </HStack>
              </Box>
              <Box flex={1}>
                <Text fontSize="xs" color="gray.600" mb={1} fontWeight="500">
                  Max Price
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.700">₹</Text>
                  <Input
                    placeholder="No Max"
                    value={maxPrice}
                    onChange={handleMaxChange}
                    size="sm"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                  />
                  {maxPrice && (
                    <IconButton
                      aria-label="Clear max"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      onClick={clearMax}
                    />
                  )}
                </HStack>
              </Box>
            </HStack>

            {/* Slider */}
            <Box>
              <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                Price Range
              </Text>
              <VStack spacing={4}>
                {/* Min Price Slider */}
                <Box w="full">
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Min: ₹ {sliderValue[0].toLocaleString()}
                  </Text>
                  <Slider
                    value={sliderValue[0]}
                    onChange={(val) => {
                      const newValue = [val, sliderValue[1]];
                      setSliderValue(newValue);
                      setMinPrice(val.toLocaleString());
                      onChange(`${val}-${sliderValue[1]}`);
                    }}
                    min={0}
                    max={sliderValue[1]}
                    step={100000}
                    colorScheme="blue"
                    aria-label="min-price"
                  >
                    <SliderTrack bg="gray.200" h={2} borderRadius="full">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={5} bg="blue.500" border="2px solid white" boxShadow="0 2px 4px rgba(0,0,0,0.2)" />
                  </Slider>
                </Box>
                {/* Max Price Slider */}
                <Box w="full">
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Max: ₹ {sliderValue[1].toLocaleString()}
                  </Text>
                  <Slider
                    value={sliderValue[1]}
                    onChange={(val) => {
                      const newValue = [sliderValue[0], val];
                      setSliderValue(newValue);
                      setMaxPrice(val.toLocaleString());
                      onChange(`${sliderValue[0]}-${val}`);
                    }}
                    min={sliderValue[0]}
                    max={10000000}
                    step={100000}
                    colorScheme="blue"
                    aria-label="max-price"
                  >
                    <SliderTrack bg="gray.200" h={2} borderRadius="full">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={5} bg="blue.500" border="2px solid white" boxShadow="0 2px 4px rgba(0,0,0,0.2)" />
                  </Slider>
                </Box>
              </VStack>
            </Box>
          </VStack>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PriceRangeSelector;

