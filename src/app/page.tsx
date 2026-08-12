import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { AIDemo } from "@/components/marketing/AIDemo";
import { Stats } from "@/components/marketing/Stats";
import { ProofStrip } from "@/components/marketing/ProofStrip";
import { Services } from "@/components/marketing/Services";
import { WhyUs } from "@/components/marketing/WhyUs";
import { Doctors } from "@/components/marketing/Doctors";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { LeadForm } from "@/components/marketing/LeadForm";
import { Footer } from "@/components/marketing/Footer";

// AIDemo sits immediately below Hero on purpose — it merchandises the
// single biggest gap a "message us and wait" competitor doesn't answer,
// and burying it further down undersold it. Stats got its own section
// (it used to be cramped inside Hero); ProofStrip no longer repeats the
// patient count Stats now states clearly.
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AIDemo />
        <Stats />
        <ProofStrip />
        <Services />
        <WhyUs />
        <Doctors />
        <Testimonials />
        <Pricing />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
