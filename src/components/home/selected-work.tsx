import { getProjects } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { ProjectCard } from "@/components/work/project-card";
import { ScrollReveal } from "@/components/fx/scroll-reveal";
import { ArriveSfx } from "@/components/fx/arrive-sfx";

// Personal projects, featured first. Cards enter from alternating sides (§10).
export function SelectedWork() {
  const projects = getProjects().sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );

  return (
    <Section index="01" title="Projects" id="work" tone="dark">
      <ArriveSfx />
      <div className="project-grid flex flex-col gap-4">
        {projects.map((p, i) => (
          <ScrollReveal key={p.slug} variant={i % 2 ? "right" : "left"}>
            <ProjectCard project={p} />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
