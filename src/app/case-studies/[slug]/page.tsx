import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/content";
import { Container } from "@/components/ui/container";
import { ProjectLab } from "@/components/labs/project-lab";
import { CaseStudyHeader } from "@/components/case-study/case-study-header";
import { CsSection } from "@/components/case-study/cs-section";
import { FlowDiagram } from "@/components/case-study/flow-diagram";
import {
  InsightCallout,
  NextTime,
  PointList,
  TradeoffList,
} from "@/components/case-study/case-study-parts";

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return { title: study.title, description: study.oneLiner };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  let n = 0;
  return (
    <div className="dimension-dark halftone-surface min-h-screen">
      <Container className="flex flex-col gap-14 py-16 sm:py-24">
        <CaseStudyHeader study={study} />
        <CsSection n={++n} label="Situation">
          <p className="max-w-2xl text-base leading-relaxed text-foreground">
            {study.situation}
          </p>
        </CsSection>
        <CsSection n={++n} label="What I built">
          <PointList points={study.points} />
        </CsSection>
        <CsSection n={++n} label="Architecture">
          <FlowDiagram flow={study.flow} />
        </CsSection>
        {study.lab ? (
          <CsSection n={++n} label="Try it yourself">
            <ProjectLab slug={study.lab} />
          </CsSection>
        ) : null}
        <CsSection n={++n} label="Considered and rejected">
          <TradeoffList tradeoffs={study.tradeoffs} />
        </CsSection>
        <div className="flex flex-col gap-4">
          <InsightCallout insight={study.insight} />
          {study.nextTime ? <NextTime text={study.nextTime} /> : null}
        </div>
      </Container>
    </div>
  );
}
