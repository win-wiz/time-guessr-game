import { memo } from "react";

const HowToPlay = memo(() => {
  const gameSteps = [
    {
      number: 1,
      title: "View Street Scene:",
      description: "Examine a real street view image from around the world with strategically blurred signs and text to increase difficulty"
    },
    {
      number: 2,
      title: "Analyze Visual Clues:",
      description: "Study architectural styles, landscape features, building types, and urban planning patterns"
    },
    {
      number: 3,
      title: "Make Your Guess:",
      description: "Click on the interactive world map to place your location prediction within the time limit"
    },
    {
      number: 4,
      title: "Receive Score:",
      description: "Earn points based on the distance between your guess and the actual location"
    },
    {
      number: 5,
      title: "Complete 5 Rounds:",
      description: "Finish all rounds to get your total score and compare with other players"
    }
  ];

  const scoringLevels = [
    {
      score: "5000",
      level: "Perfect",
      distance: "0-50 meters",
      description: "Exceptional local knowledge",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      levelColor: "text-green-800 dark:text-green-300"
    },
    {
      score: "4000+",
      level: "Excellent",
      distance: "50-250 meters",
      description: "Very close guess",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      levelColor: "text-blue-800 dark:text-blue-300"
    },
    {
      score: "3000+",
      level: "Good",
      distance: "250m-1km",
      description: "Right neighborhood",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
      levelColor: "text-yellow-800 dark:text-yellow-300"
    },
    {
      score: "1000+",
      level: "Fair",
      distance: "1-5 kilometers",
      description: "Correct general area",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      levelColor: "text-orange-800 dark:text-orange-300"
    },
    {
      score: "0-999",
      level: "Poor",
      distance: "5+ kilometers",
      description: "Keep practicing!",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      levelColor: "text-red-800 dark:text-red-300"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#00205B] dark:to-[#001845]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            How to Master TimeGuessr
          </h2>
          <p className="text-xl text-gray-600 dark:text-blue-200 max-w-4xl mx-auto">
            Follow our comprehensive guide to become a world geography expert and achieve high scores in every timed game session.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Game Mechanics</h3>
              <ol className="space-y-4 text-lg">
                {gameSteps.map((step) => (
                  <li key={step.number} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#CF142B] text-white rounded-full flex items-center justify-center font-bold">
                      {step.number}
                    </span>
                    <div>
                      <strong>{step.title}</strong> {step.description}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white dark:bg-[#00205B] p-8 rounded-2xl shadow-xl">
              <img
                src="/CalgaryGuessrThumbnail.webp"
                alt="Global cityscape featuring diverse urban landscapes from around the world"
                className="rounded-xl w-full h-64 object-cover mb-6"
              />
              <h4 className="text-xl font-semibold mb-4">Sample Global Location</h4>
              <p className="text-gray-600 dark:text-blue-200">
                This image shows an urban skyline from one of many global locations. Players must quickly identify specific locations 
                using visual context clues like building architecture, street layouts, and geographical features within the time limit.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#00205B] rounded-2xl p-8 shadow-xl">
            <h3 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Detailed Scoring System</h3>
            <div className="grid md:grid-cols-5 gap-6">
              {scoringLevels.map((level, index) => (
                <div key={index} className={`text-center p-4 ${level.bgColor} rounded-xl`}>
                  <div className={`text-3xl font-bold ${level.textColor} mb-2`}>{level.score}</div>
                  <div className={`font-semibold ${level.levelColor} mb-1`}>{level.level}</div>
                  <div className={`text-sm ${level.textColor}`}>{level.distance}</div>
                  <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">{level.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HowToPlay.displayName = 'HowToPlay';

export default HowToPlay;