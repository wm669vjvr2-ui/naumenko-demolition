import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  typescript: {
    // Cloudflare-only types are irrelevant to the static Pages export.
    // The normal Sites build still performs its own compilation checks.
    ignoreBuildErrors: isGitHubPages,
  },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/naumenko-demolition",
        assetPrefix: "/naumenko-demolition",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
