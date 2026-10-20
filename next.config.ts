import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["occt-import-js"],
  outputFileTracingExcludes: {
    "*": [
      "./data/print-queue.json",
      "./public/uploads/prints/**",
      "./.env*.local",
    ],
  },
};

export default nextConfig;
