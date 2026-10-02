// The site may be served under a sub-path (GitHub Pages: /<repo-name>).
// <Link> handles this automatically; anything that builds URLs by hand
// (next/image src, router.push from a raw href) must go through these helpers.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// "/portrait.png" -> "/<repo>/portrait.png"
export const withBasePath = (path: string) => `${basePath}${path}`;

// "/<repo>/case-studies/x/" -> "/case-studies/x/" (router.push re-adds it)
export const stripBasePath = (path: string) =>
  basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
