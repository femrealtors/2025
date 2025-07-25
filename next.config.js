/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Advertencia: Esto permite que el proyecto se compile incluso si tiene errores de ESLint.
    // Es útil para desplegar rápidamente, pero deberías volver a habilitarlo
    // y corregir los errores de linting más adelante.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
