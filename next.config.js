/** @type {import('next').NextConfig} */
const DEFAULT_API_PROXY_TARGET = "https://apidev.gamana.app";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_MARKETPLACE_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  DEFAULT_API_PROXY_TARGET;

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  output: 'export',
  // Required for Railway/`serve`: without this, Next emits both `page.html` and an
  // empty `page/` directory, and `serve` prefers the directory → 404 on blog/tour URLs.
  trailingSlash: true,
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
