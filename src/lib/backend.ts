// Base URL of the NestJS voice/chat backend. The agent + model orchestration
// now live there; this site is a client of it. Override per environment with
// NEXT_PUBLIC_BACKEND_URL (must be public — the browser calls it directly).
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");
