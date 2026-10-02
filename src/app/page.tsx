import { Hero } from "@/components/home/hero";
import { FocusAreas } from "@/components/home/focus-areas";
import { CaseStudies } from "@/components/home/case-studies";
import { SelectedWork } from "@/components/home/selected-work";
import { Now } from "@/components/home/now";
import { ExperienceList } from "@/components/home/experience-list";
import { About } from "@/components/home/about";
import { SignOff } from "@/components/home/sign-off";

export default function Home() {
  return (
    <>
      <Hero />
      <FocusAreas />
      <CaseStudies />
      <SelectedWork />
      <Now />
      <ExperienceList />
      <About />
      <SignOff />
    </>
  );
}
