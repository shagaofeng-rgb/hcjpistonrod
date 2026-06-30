import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ldycdn.com",
      },
    ],
  },
};

export default nextConfig;
