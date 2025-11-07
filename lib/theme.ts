import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `'Playfair Display', serif`,
    body: `'Playfair Display', serif`,
  },
  styles: {
    global: {
      body: {
        fontFamily: `'Playfair Display', serif`,
      },
      h1: {
        fontFamily: `'Playfair Display', serif`,
      },
      h2: {
        fontFamily: `'Playfair Display', serif`,
      },
      h3: {
        fontFamily: `'Playfair Display', serif`,
      },
      h4: {
        fontFamily: `'Playfair Display', serif`,
      },
      h5: {
        fontFamily: `'Playfair Display', serif`,
      },
      h6: {
        fontFamily: `'Playfair Display', serif`,
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
      },
    },
    Text: {
      baseStyle: {
        fontFamily: `'Playfair Display', serif`,
      },
    },
    Button: {
      baseStyle: {
        fontFamily: `'Playfair Display', serif`,
      },
    },
  },
});

export default theme;

