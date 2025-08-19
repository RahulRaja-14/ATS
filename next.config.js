/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle canvas and encoding for react-pdf
    if (isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
