import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      root: '..',
    },
  },
};

export default nextConfig;
