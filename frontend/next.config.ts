import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración general
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Desactivar generación de trazas
  generateBuildId: async () => 'build',
  
  // Configuración de desarrollo
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configuración de Webpack en lugar de Turbopack por ahora
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
