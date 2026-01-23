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
};

export default nextConfig;
