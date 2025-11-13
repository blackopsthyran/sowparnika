/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimize images
  images: {
    // FIXED: Migrated from deprecated 'domains' to 'remotePatterns' (Next.js 13+)
    // This provides better security and prevents excessive image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // Add Supabase storage domains dynamically
      // FIXED: Support both supabase.co and supabase.com, and handle storage subdomains
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? (() => {
            try {
              const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
              const baseHostname = supabaseUrl.hostname;
              // Extract project ref from hostname (e.g., xyz.supabase.co -> xyz)
              const projectRef = baseHostname.split('.')[0];
              
              return [
                // Main Supabase hostname
                {
                  protocol: 'https',
                  hostname: baseHostname,
                },
                // Storage subdomain pattern (e.g., xyz.supabase.co/storage)
                // Note: Next.js remotePatterns doesn't support pathname matching,
                // but the hostname pattern will match storage URLs
                {
                  protocol: 'https',
                  hostname: `${projectRef}.supabase.co`,
                },
                {
                  protocol: 'https',
                  hostname: `${projectRef}.supabase.com`,
                },
              ];
            } catch (e) {
              // Fallback if URL parsing fails
              return [{
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/^https?:\/\//, '').split('/')[0],
              }];
            }
          })()
        : []),
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // FIXED: Increased minimumCacheTTL to reduce repeated optimizations
    // Images will be cached for 1 year (31536000 seconds) to prevent re-optimization
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable compression
  compress: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      // FIXED: Specific API routes with caching must come BEFORE the catch-all
      // This allows image upload responses to be cached properly
      {
        source: '/api/get-properties',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=30, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/api/upload-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, stale-while-revalidate=86400, immutable',
          },
        ],
      },
      {
        source: '/api/get-property',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=30, max-age=10',
          },
        ],
      },
      // Catch-all for other API routes (no caching for dynamic content)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
