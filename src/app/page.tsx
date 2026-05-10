import MarketingLayout    from "@/components/layout/MarketingLayout";
import HeroSection        from "@/components/sections/HeroSection";
import TrustBar           from "@/components/sections/TrustBar";
import HowItWorks         from "@/components/sections/HowItWorks";
import FeaturesSection    from "@/components/sections/FeaturesSection";
import ComparisonSection  from "@/components/sections/ComparisonSection";
import CTASection         from "@/components/sections/CTASection";

// Home page — wrapped in MarketingLayout for banner + nav + footer
export default function Home() {
  return (
    <MarketingLayout>
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <FeaturesSection />
      <ComparisonSection />
      <CTASection />
    </MarketingLayout>
  );
}
