import Header from "@/components/Header";
import { HeroSection, GameFeatures, HowToPlay, ProTips, FAQ } from "@/components/home";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <HeroSection />
      <GameFeatures />
      <HowToPlay />
      <ProTips />
      <FAQ />
    </main>
  );
}
