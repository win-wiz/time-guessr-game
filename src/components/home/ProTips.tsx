import { memo } from "react";

const ProTips = memo(() => {
  const tips = [
    {
      emoji: "🏔️",
      title: "Terrain & Geography Analysis",
      description: "Use natural features as your compass. Mountains, coastlines, and terrain can quickly narrow down possible regions and help you make faster, more accurate guesses.",
      points: [
        "Mountain ranges indicate specific regions",
        "Coastal views suggest proximity to water bodies",
        "Desert/forest terrain narrows location possibilities"
      ],
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#00205B] dark:to-[#003566]",
      textColor: "text-blue-900 dark:text-blue-100",
      descColor: "text-blue-800 dark:text-blue-200",
      listColor: "text-blue-700 dark:text-blue-300"
    },
    {
      emoji: "🏗️",
      title: "Architectural Style Recognition",
      description: "Different regions have distinct architectural patterns that can quickly identify countries or continents.",
      points: [
        "European style = likely European cities",
        "Asian architecture = East/Southeast Asian regions",
        "Colonial buildings = former colonial territories"
      ],
      bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      textColor: "text-green-900 dark:text-green-100",
      descColor: "text-green-800 dark:text-green-200",
      listColor: "text-green-700 dark:text-green-300"
    },
    {
      emoji: "🌊",
      title: "Water Bodies & Climate",
      description: "Rivers, lakes, and climate clues can quickly identify regions and help you guess faster.",
      points: [
        "Tropical vegetation = equatorial regions",
        "Snow/ice = northern latitudes or high altitude",
        "Arid landscape = desert regions"
      ],
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      textColor: "text-purple-900 dark:text-purple-100",
      descColor: "text-purple-800 dark:text-purple-200",
      listColor: "text-purple-700 dark:text-purple-300"
    },
    {
      emoji: "🗼",
      title: "Landmark Recognition",
      description: "Famous landmarks provide instant location identification when visible in street views.",
      points: [
        "Iconic towers = major city centers",
        "Famous bridges = specific cities",
        "Unique monuments = instant country identification"
      ],
      bgColor: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
      textColor: "text-red-900 dark:text-red-100",
      descColor: "text-red-800 dark:text-red-200",
      listColor: "text-red-700 dark:text-red-300"
    },
    {
      emoji: "🛣️",
      title: "Urban Planning Patterns",
      description: "Different countries have distinct urban planning styles that can quickly identify regions.",
      points: [
        "Grid systems = North American cities",
        "Narrow medieval streets = European old towns",
        "Wide modern boulevards = planned cities"
      ],
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
      textColor: "text-yellow-900 dark:text-yellow-100",
      descColor: "text-yellow-800 dark:text-yellow-200",
      listColor: "text-yellow-700 dark:text-yellow-300"
    },
    {
      emoji: "⚡",
      title: "Speed & Time Management",
      description: "Master time management techniques to make quick, accurate decisions under pressure.",
      points: [
        "Quick scan for obvious clues first",
        "Use elimination method for regions",
        "Trust your first instinct when time is low"
      ],
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
      textColor: "text-indigo-900 dark:text-indigo-100",
      descColor: "text-indigo-800 dark:text-indigo-200",
      listColor: "text-indigo-700 dark:text-indigo-300"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#001845]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Expert Strategies & Pro Tips
          </h2>
          <p className="text-xl text-gray-600 dark:text-blue-200 max-w-4xl mx-auto">
            Master these advanced techniques to dramatically improve your world geography skills and achieve consistently high scores under time pressure.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip, index) => (
            <div key={index} className={`${tip.bgColor} p-6 rounded-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${tip.textColor}`}>
                {tip.emoji} {tip.title}
              </h3>
              <p className={`${tip.descColor} mb-3`}>
                {tip.description}
              </p>
              <ul className={`text-sm ${tip.listColor} space-y-1`}>
                {tip.points.map((point, pointIndex) => (
                  <li key={pointIndex}>• {point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ProTips.displayName = 'ProTips';

export default ProTips;