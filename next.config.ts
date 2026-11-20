import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so a lockfile elsewhere on the machine is ignored.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
