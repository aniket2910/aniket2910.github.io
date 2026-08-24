import type { ReactNode } from "react";

// Centered content column used across the site.
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-3xl px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
