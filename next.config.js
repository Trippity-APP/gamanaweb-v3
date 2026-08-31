/** @type {import('next').NextConfig} */
const apiProxyTarget =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_BLOG_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "http://localhost:8000";

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gamanastorage.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
