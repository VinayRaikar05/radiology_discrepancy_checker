/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Increase this if needed
    },
  },
};

module.exports = nextConfig;
