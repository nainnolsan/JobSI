import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Windows file system with Turbopack
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    };
    return config;
  },
};

export default nextConfig;
