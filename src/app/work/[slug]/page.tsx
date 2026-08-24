import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, getProjectSlugs } from "@/lib/content";
import { ProjectDetail } from "@/components/work/project-detail";
import { Container } from "@/components/ui/container";
import { ProjectLab } from "@/components/labs/project-lab";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.oneLiner };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="dimension-dark halftone-surface min-h-screen">
      <ProjectDetail project={project} />
      <Container className="pb-24">
        <ProjectLab slug={slug} />
      </Container>
    </div>
  );
}
