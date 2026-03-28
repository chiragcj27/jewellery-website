import type { NextConfig } from "next";

const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || "jewellery-website";
const region = process.env.NEXT_PUBLIC_S3_REGION || "ap-south-1";

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
        hostname: `${bucket}.s3.${region}.amazonaws.com`,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: `s3.${region}.amazonaws.com`,
        pathname: `/${bucket}/**`,
      },
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
