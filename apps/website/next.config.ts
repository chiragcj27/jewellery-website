import type { NextConfig } from "next";

const nextConfig: NextConfig = {  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "palmonas.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jewellery-website.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
