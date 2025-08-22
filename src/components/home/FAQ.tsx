import { memo } from "react";

const FAQ = memo(() => {
  const faqs = [
    {
      question: "How many rounds are in each TimeGuessr game?",
      answer: "Each game consists of exactly 5 rounds, providing multiple opportunities to demonstrate your global geography knowledge. This format allows for comprehensive scoring while maintaining an engaging, manageable game length that typically takes 10-15 minutes to complete."
    },
    {
      question: "What makes TimeGuessr different from other geography games?",
      answer: "TimeGuessr focuses specifically on global locations with time-based challenges, featuring real street view imagery from around the world. Our advanced scoring system rewards both accuracy and speed, while the game includes educational elements about world geography, landmarks, and cultural recognition."
    },
    {
      question: "How is my score calculated in TimeGuessr?",
      answer: "Your score is based on the distance between your guess and the actual location, with a maximum of 5000 points per round. Closer guesses earn higher scores: within 50 meters = 5000 points, 50-250 meters = 4000+ points, and so on. The total game score is the sum of all 5 rounds."
    },
    {
      question: "Can I play TimeGuessr on mobile devices?",
      answer: "Yes! TimeGuessr is fully optimized for mobile devices with responsive design and touch-friendly controls. The game works seamlessly on smartphones and tablets, allowing you to explore global geography anywhere. The mobile interface is specifically designed for easy map interaction and street view navigation."
    },
    {
      question: "Are there any time limits for making guesses?",
      answer: "TimeGuessr offers flexible time management - while the game is designed with time-based scoring elements, you can take your time to analyze clues and make educated guesses. The focus is on accuracy and learning rather than rushing, making it suitable for both casual and competitive play."
    },
    {
      question: "What types of locations appear in TimeGuessr?",
      answer: "The game features diverse locations from around the world, including major cities, suburban areas, rural landscapes, and famous landmarks. Locations span all continents and include various architectural styles, climates, and geographical features to provide a comprehensive global geography learning experience."
    },
    {
      question: "How can I improve my TimeGuessr skills?",
      answer: "Study our Pro Tips section for expert strategies! Focus on recognizing architectural styles, analyzing terrain and climate clues, identifying landmarks, and understanding urban planning patterns. Practice regularly, learn from your mistakes, and gradually build your knowledge of global geography and cultural indicators."
    },
    {
      question: "Is there a leaderboard or competitive element?",
      answer: "Yes! TimeGuessr features global leaderboards where you can compare your scores with players worldwide. Track your progress, compete for high scores, and see how your geography knowledge stacks up against other players. The competitive element adds excitement while encouraging continuous learning and improvement."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#00205B] dark:to-[#001845]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-blue-200 max-w-4xl mx-auto">
            Everything you need to know about playing TimeGuessr, from basic gameplay to advanced strategies.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{faq.question}</h3>
              <p className="text-gray-600 dark:text-blue-200">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;