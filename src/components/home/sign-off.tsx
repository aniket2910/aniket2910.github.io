import { getProfile } from "@/lib/content";
import { Container } from "@/components/ui/container";

// The signature moment — the leap-of-faith line, placed once, then contact.
export function SignOff() {
  const { signatureLine, email, socials } = getProfile();

  return (
    <section className="dimension-dark relative overflow-hidden py-24 sm:py-32">
      {/* faint web-thread nod — a wink, not a theme */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />
      {/* subtle comic halftone texture */}
      <div
        aria-hidden
        className="halftone pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <Container className="relative flex flex-col items-center text-center">
        <blockquote className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          &ldquo;{signatureLine.text}&rdquo;
        </blockquote>
        {signatureLine.source ? (
          <p className="mt-4 font-mono text-xs text-muted">
            {signatureLine.source}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${email}`}
            data-press
            data-comic="THWIP!"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            Get in touch
          </a>
        </div>

        <nav className="mt-8 flex gap-5 font-mono text-xs text-muted">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {s.label.toLowerCase()}
            </a>
          ))}
        </nav>
      </Container>
    </section>
  );
}
