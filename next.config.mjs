/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the bundled SQLite file is included in serverless functions on Vercel
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db'],
    },
  },
};

export default nextConfig;
