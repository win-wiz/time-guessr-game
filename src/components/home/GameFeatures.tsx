import { Map, Target, Trophy, HelpCircle } from "lucide-react";
import { memo } from "react";

const GameFeatures = memo(() => {
  const features = [
    {
      icon: Map,
      title: "Global Locations",
      description: "Real street scenes from cities and locations around the world, spanning diverse cultures and landscapes",
      bgColor: "bg-[#CF142B]/10 dark:bg-[#CF142B]/20",
      iconColor: "text-[#CF142B]"
    },
    {
      icon: Target,
      title: "Time-Based Scoring",
      description: "Advanced scoring system that rewards both geographical accuracy and speed of response",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Trophy,
      title: "Competitive Play",
      description: "Global leaderboards and achievement system to track your world geography mastery",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: HelpCircle,
      title: "Educational Value",
      description: "Learn world geography, landmarks, and cultures through interactive time-pressured gameplay",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#001845]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Why Choose TimeGuessr?
          </h2>
          <p className="text-xl text-gray-600 dark:text-blue-200 max-w-4xl mx-auto">
            Experience the world like never before through our innovative time-based geography game that combines 
            education, entertainment, and exploration of global destinations with exciting time challenges.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center p-6 bg-gray-50 dark:bg-[#00205B] rounded-xl hover:shadow-lg transition-all duration-300">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${feature.bgColor}`}>
                  <IconComponent className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-blue-200">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

GameFeatures.displayName = 'GameFeatures';

export default GameFeatures;