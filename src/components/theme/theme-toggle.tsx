"use client";

// Theme toggle with no React state: the label reflects the current theme purely
// via the `.dark` class (CSS), and the click flips that class + persists it.
export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-foreground"
    >
      <span className="dark:hidden">dark</span>
      <span className="hidden dark:inline">light</span>
    </button>
  );
}
