import Footer from "@/components/footer";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Landing Page Sections
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { PainSection } from "@/components/landing/pain-section";

export default async function Home() {
  const { userId } = await auth();
  
  // If user is logged in, skip the landing page entirely
  if (userId) {
    redirect("/home");
  }

  return (
    <div className="flex flex-col bg-stone-50 dark:bg-stone-950 min-h-screen">
      
      <main className="flex flex-col flex-1 w-full">
        {/* Sections are ordered for maximum conversion and SEO flow */}
        <HeroSection />
        <PainSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
