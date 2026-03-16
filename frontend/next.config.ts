import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export output so the backend can serve the built app as plain files.
  output: "export",
};

export default nextConfig;
