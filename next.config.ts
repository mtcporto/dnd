import type { NextConfig } from "next";
const config: NextConfig = {
  experimental: { serverComponentsHmrCache: false },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dnd-images.mosaicoworkers.workers.dev",
        pathname: "/**",
        search: "",
      },
    ],
  },
};
export default config;
