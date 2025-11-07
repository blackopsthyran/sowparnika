/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Increase build timeout if needed
  // experimental: {
  //   workerThreads: false,
  //   cpus: 1
  // },
  // Disable image optimization if causing issues
  images: {
    domains: ['placehold.co', 'via.placeholder.com'],
    unoptimized: false,
  },
}

module.exports = nextConfig
