import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/donor/:path*',
        destination: '/supplier/:path*',
        permanent: true,
      },
      {
        source: '/admin/donors/:path*',
        destination: '/admin/suppliers/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
