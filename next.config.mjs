/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/scanner.html",
        permanent: false,
      },
      {
        source: "/scanner",
        destination: "/scanner.html",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/dashboard.html",
        permanent: false,
      },
      {
        source: "/evaluations",
        destination: "/evaluations.html",
        permanent: false,
      },
      {
        source: "/ar-vr",
        destination: "/scanner.html",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/scanner",
        destination: "/scanner.html",
      },
      {
        source: "/dashboard",
        destination: "/dashboard.html",
      },
      {
        source: "/evaluations",
        destination: "/evaluations.html",
      },
      {
        source: "/ar-vr",
        destination: "/scanner.html",
      },
    ];
  },
};

export default nextConfig;
