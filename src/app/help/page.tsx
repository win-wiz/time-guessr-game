import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Help Center - TimeGuessr",
  description: "Get help with TimeGuessr - Find answers to frequently asked questions and learn how to play our geography guessing game.",
  robots: "index, follow",
};

export default function HelpCenter() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Help Center</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Getting Started */}
          <div className="bg-gray-50 dark:bg-[#00205B] p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[#CF142B]">Getting Started</h2>
            <div className="space-y-4 text-gray-700 dark:text-blue-100">
              <div>
                <h3 className="font-medium mb-2">How to Play</h3>
                <p className="text-sm">Look at the street view image and guess the location on the world map. The closer your guess, the higher your score!</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Scoring System</h3>
                <p className="text-sm">Points are awarded based on the distance between your guess and the actual location. Perfect guesses earn maximum points.</p>
              </div>
            </div>
          </div>

          {/* Account & Profile */}
          <div className="bg-gray-50 dark:bg-[#00205B] p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[#CF142B]">Account & Profile</h2>
            <div className="space-y-4 text-gray-700 dark:text-blue-100">
              <div>
                <h3 className="font-medium mb-2">Creating an Account</h3>
                <p className="text-sm">Sign up to track your progress, compete on leaderboards, and save your game statistics.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Leaderboards</h3>
                <p className="text-sm">Compete with players worldwide and see how you rank on our global leaderboards.</p>
              </div>
            </div>
          </div>

          {/* Technical Support */}
          <div className="bg-gray-50 dark:bg-[#00205B] p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[#CF142B]">Technical Support</h2>
            <div className="space-y-4 text-gray-700 dark:text-blue-100">
              <div>
                <h3 className="font-medium mb-2">Browser Requirements</h3>
                <p className="text-sm">TimeGuessr works best on modern browsers with JavaScript enabled. We recommend Chrome, Firefox, Safari, or Edge.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Troubleshooting</h3>
                <p className="text-sm">If you're experiencing issues, try refreshing the page, clearing your browser cache, or disabling browser extensions.</p>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="bg-gray-50 dark:bg-[#00205B] p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[#CF142B]">Game Features</h2>
            <div className="space-y-4 text-gray-700 dark:text-blue-100">
              <div>
                <h3 className="font-medium mb-2">Time Limits</h3>
                <p className="text-sm">Some game modes include time limits to add challenge. Take your time in practice mode to learn.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Hints and Clues</h3>
                <p className="text-sm">Look for signs, architecture, vegetation, and other visual clues to help identify locations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-[#001845] pb-4">
              <h3 className="text-xl font-semibold mb-2">Is TimeGuessr free to play?</h3>
              <p className="text-gray-700 dark:text-blue-100">Yes! TimeGuessr is completely free to play. Create an account to track your progress and compete on leaderboards.</p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-[#001845] pb-4">
              <h3 className="text-xl font-semibold mb-2">How accurate do my guesses need to be?</h3>
              <p className="text-gray-700 dark:text-blue-100">The scoring system rewards accuracy, but you don't need to be perfect. Even guesses within the same country or region can earn points.</p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-[#001845] pb-4">
              <h3 className="text-xl font-semibold mb-2">Can I play on mobile devices?</h3>
              <p className="text-gray-700 dark:text-blue-100">Yes! TimeGuessr is fully responsive and works great on smartphones and tablets.</p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-[#001845] pb-4">
              <h3 className="text-xl font-semibold mb-2">How do I improve my geography skills?</h3>
              <p className="text-gray-700 dark:text-blue-100">Practice regularly, study different regions, and pay attention to architectural styles, vegetation, and cultural clues in the street view images.</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
          <p className="text-gray-700 dark:text-blue-100 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-[#CF142B] text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}