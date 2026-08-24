import Link from "next/link";
import { Container } from "@/components/ui/container";

// A page that landed in the wrong dimension: speed lines converge, the 404
// glyph glitches with a chroma rip, and the way home is a leap.
export default function NotFound() {
  return (
    <section className="dimension-dark speed-lines relative flex min-h-[70vh] items-center overflow-hidden py-24 sm:py-32">
      <Container className="relative flex flex-col items-center text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">
          Wrong dimension
        </p>
        <h1 className="glitch-404 chroma-text mt-4 font-display text-7xl uppercase leading-none tracking-tight sm:text-9xl">
          404
        </h1>
        <p className="mt-6 max-w-md text-balance text-base leading-relaxed text-muted">
          This page slipped through a glitch to some other universe. The link is
          broken, or it was never here to begin with.
        </p>
        <Link
          href="/"
          data-press
          data-transition="LEAP!"
          className="mt-10 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Take the leap home
        </Link>
      </Container>
    </section>
  );
}
