import Image from "next/image";
import { getProfile } from "@/lib/content";

// The pre-stylized comic portrait, frameless, with a gentle float.
export function Portrait() {
  const { photoUrl, name } = getProfile();
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="animate-float relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          priority
          sizes="176px"
          className="rounded-xl object-cover [object-position:50%_20%]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-transparent">
          <span className="font-mono text-3xl font-medium text-accent">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
