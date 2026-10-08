import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/tetiana-redko.appspot.com/**",
      },
    ],
  },
};

export default nextConfig;
