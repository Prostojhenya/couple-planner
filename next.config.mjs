/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Отключаем ESLint во время production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорируем ошибки TypeScript во время build (только warnings)
    ignoreBuildErrors: false,
  },
  // Отключаем статическую оптимизацию для динамических страниц
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async redirects() {
    return [
      {
        source: '/icon.svg',
        destination: '/icon-512.png',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
