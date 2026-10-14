import type { NextConfig } from "next";
const config: NextConfig = { images: { remotePatterns: [{ protocol: "https", hostname: "www.dnd5eapi.co", pathname: "/api/images/monsters/**", search: "" }] } };
export default config;
