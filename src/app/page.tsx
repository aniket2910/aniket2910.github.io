import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { ExperienceList } from "@/components/home/experience-list";
import { About } from "@/components/home/about";
import { SignOff } from "@/components/home/sign-off";

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <ExperienceList />
      <About />
      <SignOff />
    </>
  );
}
