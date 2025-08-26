import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeroSection, GameFeatures, HowToPlay, ProTips, FAQ, CallToAction } from "@/components/home";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <HeroSection />
      <GameFeatures />
      <HowToPlay />
      <ProTips />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  );
}
