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
};

export default nextConfig;
