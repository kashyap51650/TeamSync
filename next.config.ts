import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  turbopack: {
    rules: {
      "**/*.{tsx,jsx}": {
        loaders: [
          {
            loader: "@locator/webpack-loader",
            options: { env: "development" },
          },
        ],
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "facebook.com",
      },
    ],
  },
};

export default nextConfig;
