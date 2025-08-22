import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Play, Clock, Target, Trophy } from "lucide-react";
import { memo } from "react";

const HeroSection = memo(() => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#001233] dark:to-[#00205B] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-center gap-4">
            <MapPin className="h-16 w-16 text-[#CF142B]" />
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#CF142B] to-[#00205B] bg-clip-text text-transparent">
              TimeGuessr
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800 dark:text-blue-100">
            The Ultimate Time-Based Geography Challenge Game
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-blue-200 leading-relaxed">
            Test your knowledge of global locations through an immersive time-based street view guessing game. 
            Explore authentic locations from around the world, analyze visual clues, and compete with players worldwide 
            in this engaging geography adventure that challenges your speed and accuracy.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-white dark:bg-[#00205B] px-4 py-2 rounded-full shadow-md">
              <Clock className="h-5 w-5 text-[#CF142B]" />
              <span className="font-medium">No Time Pressure</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-[#00205B] px-4 py-2 rounded-full shadow-md">
              <Target className="h-5 w-5 text-[#CF142B]" />
              <span className="font-medium">Skill-Based Scoring</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-[#00205B] px-4 py-2 rounded-full shadow-md">
              <Trophy className="h-5 w-5 text-[#CF142B]" />
              <span className="font-medium">Global Leaderboard</span>
            </div>
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