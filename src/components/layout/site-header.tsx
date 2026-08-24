import Link from "next/link";
import { getProfile } from "@/lib/content";
import { ThemeToggle } from "@/components/theme/theme-toggle";

// Sticky, quiet header. Name links home; nav jumps to sections.
export function SiteHeader() {
  const { name } = getProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="rgb-title font-mono text-sm font-medium tracking-tight transition-colors"
        >
          {name.toLowerCase().replace(/\s+/g, ".")}
        </Link>
        <nav className="flex items-center gap-4 font-mono text-xs text-muted">
          <Link href="/#work" className="transition-colors hover:text-foreground">
            work
          </Link>
          <Link href="/#about" className="transition-colors hover:text-foreground">
            about
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
