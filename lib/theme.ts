import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `'Playfair Display', serif`,
    body: `'Playfair Display', serif`,
  },
  colors: {
    brand: {
      50: '#f7f7f7',
      100: '#e1e1e1',
      200: '#cfcfcf',
      300: '#b1b1b1',
      400: '#9e9e9e',
      500: '#7e7e7e',
      600: '#626262',
      700: '#515151',
      800: '#3b3b3b',
      900: '#1a1a1a',
    },
  },
  styles: {
    global: {
      body: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
        bg: 'white',
      },
      h1: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
      },
      h2: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
      },
      h3: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
      },
      h4: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
      },
      h5: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
      },
      h6: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
      },
      button: {
        fontFamily: `'Playfair Display', serif`,
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
        fontWeight: '700',
      },
    },
    Text: {
      baseStyle: {
        fontFamily: `'Playfair Display', serif`,
        color: 'gray.900',
      },
    },
    Button: {
      baseStyle: {
        fontFamily: `'Playfair Display', serif`,
        borderRadius: '0', // Sharp corners for edgy look
        fontWeight: '600',
      },
      variants: {
        solid: {
          bg: 'gray.900',
          color: 'white',
          _hover: {
            bg: 'gray.800',
          },
        },
        outline: {
          borderColor: 'gray.900',
          color: 'gray.900',
          _hover: {
            bg: 'gray.900',
            color: 'white',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '0', // Sharp corners
          border: '1px solid',
          borderColor: 'gray.200',
          boxShadow: 'none',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: '0', // Sharp corners
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'gray.900',
            boxShadow: '0 0 0 1px gray.900',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: '0',
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'gray.900',
            boxShadow: '0 0 0 1px gray.900',
          },
        },
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: '0',
        borderColor: 'gray.300',
        _focus: {
          borderColor: 'gray.900',
          boxShadow: '0 0 0 1px gray.900',
        },
      },
    },
  },
});

export default theme;

