/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['app.morpho.org', 'app.lagoon.finance', 'app.upshift.finance'],
  },
  // Allow wagmi/viem to work properly
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
