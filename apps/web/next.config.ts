import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kull/contracts"],
};

export default nextConfig;
