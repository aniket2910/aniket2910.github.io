import { Hero } from "@/components/home/hero";
import { FocusAreas } from "@/components/home/focus-areas";
import { CaseStudies } from "@/components/home/case-studies";
import { SelectedWork } from "@/components/home/selected-work";
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
      <ExperienceList />
      <About />
      <SignOff />
    </>
  );
}
