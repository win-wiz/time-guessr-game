import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Play, Clock, Target, Trophy, Zap, Brain, Sparkles } from "lucide-react";
import { memo, useMemo } from "react";

// Performance optimization: Extract constants to avoid recreation on each render
const FEATURE_ITEMS = [
  { icon: Clock, text: "No Time Pressure" },
  { icon: Target, text: "Skill-Based Scoring" },
  { icon: Trophy, text: "Global Leaderboard" }
] as const;

const COMMON_STYLES = {
  featureCard: "flex items-center gap-2 bg-white dark:bg-[#00205B] px-4 py-2 rounded-full shadow-md",
  iconStyle: "h-5 w-5 text-[#CF142B]",
  aiPoweredBadge: "flex items-center gap-2 bg-gradient-to-r from-[#CF142B] to-[#00205B] text-white px-4 py-2 rounded-full shadow-lg"
} as const;

const HeroSection = memo(() => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#001233] dark:to-[#00205B] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-center gap-4">
            <Image
              src="/logo.svg"
              alt="TimeGuessr Logo"
              width={64}
              height={64}
              className="h-16 w-16"
            />
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#CF142B] to-[#00205B] bg-clip-text text-transparent">
              TimeGuessr
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800 dark:text-blue-100">
            The Ultimate Time-Based Geography Challenge Game
          </h2>
          
          {/* AI Feature Display - Integrated Title Supplement */}
          <div className="mb-10 flex items-center justify-center gap-3 flex-wrap">
            <div className={COMMON_STYLES.aiPoweredBadge}>
              <Brain className="h-5 w-5" />
              <span className="font-bold text-sm">AI POWERED</span>
            </div>
            <span className="text-xl font-medium text-gray-700 dark:text-blue-200">
              AI-Driven Global Street View Guessing Game
            </span>
            <Sparkles className="h-5 w-5 text-[#CF142B] animate-pulse" />
          </div>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-blue-200 leading-relaxed">
            Test your knowledge of global locations through an immersive time-based street view guessing game. 
            Explore authentic locations from around the world, analyze visual clues, and compete with players worldwide 
            in this engaging geography adventure that challenges your speed and accuracy.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {FEATURE_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className={COMMON_STYLES.featureCard}>
                <Icon className={COMMON_STYLES.iconStyle} />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
          <Link href="/game">
            <Button className="bg-[#CF142B] hover:bg-[#B01226] text-white text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              <Play className="mr-3 h-6 w-6" />
              Start Playing Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;