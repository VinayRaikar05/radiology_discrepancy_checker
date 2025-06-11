export const nextConfig = {
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '10mb', // ← raise limit here
  },
};

export default nextConfig;
