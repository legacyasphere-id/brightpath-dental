import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { AIDemo } from "@/components/marketing/AIDemo";
import { Stats } from "@/components/marketing/Stats";
import { ProofStrip } from "@/components/marketing/ProofStrip";
import { Services } from "@/components/marketing/Services";
import { Facility } from "@/components/marketing/Facility";
import { Doctors } from "@/components/marketing/Doctors";
import { WhyUs } from "@/components/marketing/WhyUs";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";
import { LeadForm } from "@/components/marketing/LeadForm";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        <Facility />
        <Doctors />
        <WhyUs />
        <AIDemo />
        <Stats />
        <ProofStrip />
        <Testimonials />
        <Pricing />
        <FAQ />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
