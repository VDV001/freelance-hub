import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { TechStackSection } from "@/components/sections/tech-stack";
import { ExperienceSection } from "@/components/sections/experience";
import { ProjectsSection } from "@/components/sections/projects";
import { EducationSection } from "@/components/sections/education";
import { CertificatesSection } from "@/components/sections/certificates";
import { ContactSection } from "@/components/sections/contact";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <TechStackSection />
      <ExperienceSection />
      <ProjectsSection />
      <EducationSection />
      <CertificatesSection />
      <ContactSection />
    </>
  );
}
