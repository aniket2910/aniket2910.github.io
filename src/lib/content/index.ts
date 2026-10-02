// Re-export shim — the profile data now lives in the shared workspace package
// `@portfolio/content`, consumed by both this site and the NestJS backend.
// UI components keep importing from `@/lib/content` unchanged; this file just
// forwards to the package so there's one source of truth.
export * from "@portfolio/content";
