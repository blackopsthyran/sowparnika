import React from 'react';
import { Box } from '@chakra-ui/react';

interface RetroGridProps {
  className?: string;
  angle?: number;
}

const RetroGrid: React.FC<RetroGridProps> = ({ className, angle = 65 }) => {
  return (
    <Box
      pointerEvents="none"
      position="absolute"
      width="100%"
      height="100%"
      overflow="hidden"
      opacity={0.8}
      sx={{
        perspective: '200px',
      }}
      className={className}
      zIndex={0}
    >
      {/* Grid */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        sx={{
          transform: `rotateX(${angle}deg)`,
        }}
      >
        <Box
          position="absolute"
          width="600vw"
          height="300vh"
          left="0%"
          top={0}
          marginLeft="-50%"
          sx={{
            backgroundRepeat: 'repeat',
            backgroundSize: '60px 60px',
            transformOrigin: '100% 0 0',
            backgroundImage: [
              'linear-gradient(to right, rgba(0,0,0,1) 1px, transparent 0)',
              'linear-gradient(to bottom, rgba(0,0,0,1) 1px, transparent 0)',
            ].join(', '),
          }}
          style={{
            animation: 'grid-scroll 20s linear infinite',
          }}
        />
      </Box>

      {/* Background Gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        sx={{
          background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 90%)',
        }}
      />
    </Box>
  );
};

export default RetroGrid;

