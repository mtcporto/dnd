import type { NextConfig } from "next";
const config: NextConfig = {
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
