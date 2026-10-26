import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "true";
const basePath = "/CoRise";

const nextConfig: NextConfig = {
  ...(pages
    ? {
        output: "export" as const,
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
        env: { NEXT_PUBLIC_BASE_PATH: basePath },
      }
    : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
