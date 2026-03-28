import type { NextConfig } from "next";

const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || "jewellery-website";
const region = process.env.NEXT_PUBLIC_S3_REGION || "ap-south-1";

/** Hostnames from NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=comma,separated (e.g. CloudFront domain matching AWS_S3_PUBLIC_BASE_URL) */
function extraImageHosts(): { protocol: "https"; hostname: string; pathname: string }[] {
  const raw = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS || "";
  return raw
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
    .map((hostname) => ({ protocol: "https" as const, hostname, pathname: "/**" }));
}

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
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      // Virtual-hosted–style (default from uploadToS3)
      {
        protocol: "https",
        hostname: `${bucket}.s3.${region}.amazonaws.com`,
        pathname: "/**",
      },
      // Path-style URLs (some imports / tools still emit these)
      {
        protocol: "https",
        hostname: `s3.${region}.amazonaws.com`,
        pathname: `/${bucket}/**`,
      },
      // Dual-stack virtual-hosted hostname
      {
        protocol: "https",
        hostname: `${bucket}.s3.dualstack.${region}.amazonaws.com`,
        pathname: "/**",
      },
      ...extraImageHosts(),
    ],
  },
};

export default nextConfig;
