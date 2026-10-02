import { Hero } from "@/components/home/hero";
import { CaseStudies } from "@/components/home/case-studies";
import { Now } from "@/components/home/now";
import { ExperienceList } from "@/components/home/experience-list";
import { About } from "@/components/home/about";
import { SignOff } from "@/components/home/sign-off";

export default function Home() {
  return (
    <>
      <Hero />
      <CaseStudies />
      <Now />
      <ExperienceList />
      <About />
      <SignOff />
    </>
  );
}
