/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/scanner.html",
      },
      {
        source: "/scanner",
        destination: "/scanner.html",
      },
    ];
  },
};

export default nextConfig;
