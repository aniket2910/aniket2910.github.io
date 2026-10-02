import { getProfile, getSkills } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "@/components/fx/scroll-reveal";

// What Aniket is looking for, grounded by the skills he builds with.
export function About() {
  const { about } = getProfile();
  const skills = getSkills();

  return (
    <Section index="05" title="About" id="about">
      <ScrollReveal>
        <p className="max-w-2xl text-lg leading-relaxed text-foreground">
          {about}
        </p>
      </ScrollReveal>

      <div className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {skills.map((group, i) => (
          <ScrollReveal key={group.category} delay={i * 60}>
            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-xs uppercase tracking-wide text-accent">
                {group.category}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {group.items.join(" · ")}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
