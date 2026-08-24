import { getProfile } from "@/lib/content";

// Quiet footer: socials + a small year line.
export function SiteFooter() {
  const { socials, name } = getProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono text-xs text-muted">
          © {year} {name}
        </p>
        <nav className="flex gap-4 font-mono text-xs text-muted">
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
      </div>
    </footer>
  );
}
