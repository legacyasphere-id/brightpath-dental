import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { Services } from "@/components/marketing/Services";
import { WhyUs } from "@/components/marketing/WhyUs";
import { AIDemo } from "@/components/marketing/AIDemo";
import { Doctors } from "@/components/marketing/Doctors";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { LeadForm } from "@/components/marketing/LeadForm";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        <WhyUs />
        <AIDemo />
        <Doctors />
        <Testimonials />
        <Pricing />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
