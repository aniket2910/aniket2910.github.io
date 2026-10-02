import type { NextConfig } from "next";

// GitHub Pages serves a project repo under /<repo-name>. The deploy workflow
// sets PAGES_BASE_PATH to that prefix; locally it is empty so dev is unchanged.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML/CSS/JS to `out/`.
  output: "export",
  basePath,
  // Emit /case-studies/x/index.html so static hosts resolve clean URLs.
  trailingSlash: true,
  // No image server on a static host; images are served as-is.
  images: { unoptimized: true },
  // Exposed to client code that builds URLs by hand (see src/lib/base-path.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Hide the floating Next.js dev indicator badge.
  devIndicators: false,
  // The shared workspace package ships TypeScript source; let Next transpile it.
  transpilePackages: ["@portfolio/content"],
};

export default nextConfig;
