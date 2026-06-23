import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/api/*": ["../.data/**/*"],
    "/instrumentation": ["../.data/**/*"],
    "/*": ["../.data/**/*"],
  },
  turbopack: {
    root: join(currentDir, ".."),
  },
};

export default nextConfig;
