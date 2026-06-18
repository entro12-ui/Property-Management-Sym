import type { NextConfig } from 'next';

const quietLogs = process.env.QUIET_LOGS !== 'false';

const nextConfig: NextConfig = {
  logging: quietLogs
    ? {
        incomingRequests: false,
        fetches: {
          fullUrl: false,
          hmrRefreshes: false,
        },
      }
    : undefined,
};

export default nextConfig;
