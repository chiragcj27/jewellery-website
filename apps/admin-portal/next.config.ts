import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jewellery-website.s3.ap-south-1.amazonaws.com',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;
