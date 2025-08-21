import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { MapPin, Play, HelpCircle, MessageCircle, Target, Clock, Trophy, Map } from "lucide-react";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      
      {/* Hero Section */}
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

      {/* Game Features Section */}
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
            <div className="text-center p-6 bg-gray-50 dark:bg-[#00205B] rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CF142B]/10 dark:bg-[#CF142B]/20">
                <Map className="h-8 w-8 text-[#CF142B]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Locations</h3>
               <p className="text-gray-600 dark:text-blue-200">Real street scenes from cities and locations around the world, spanning diverse cultures and landscapes</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-[#00205B] rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Time-Based Scoring</h3>
               <p className="text-gray-600 dark:text-blue-200">Advanced scoring system that rewards both geographical accuracy and speed of response</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-[#00205B] rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Competitive Play</h3>
               <p className="text-gray-600 dark:text-blue-200">Global leaderboards and achievement system to track your world geography mastery</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-[#00205B] rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <HelpCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Educational Value</h3>
               <p className="text-gray-600 dark:text-blue-200">Learn world geography, landmarks, and cultures through interactive time-pressured gameplay</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
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
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#CF142B] text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                       <strong>View Street Scene:</strong> Examine a real street view image from around the world with strategically blurred signs and text to increase difficulty
                     </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#CF142B] text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <strong>Analyze Visual Clues:</strong> Study architectural styles, landscape features, building types, and urban planning patterns
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#CF142B] text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                       <strong>Make Your Guess:</strong> Click on the interactive world map to place your location prediction within the time limit
                     </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#CF142B] text-white rounded-full flex items-center justify-center font-bold">4</span>
                    <div>
                      <strong>Receive Score:</strong> Earn points based on the distance between your guess and the actual location
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#CF142B] text-white rounded-full flex items-center justify-center font-bold">5</span>
                    <div>
                      <strong>Complete 5 Rounds:</strong> Finish all rounds to get your total score and compare with other players
                    </div>
                  </li>
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
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">5000</div>
                  <div className="font-semibold text-green-800 dark:text-green-300 mb-1">Perfect</div>
                  <div className="text-sm text-green-600 dark:text-green-400">0-50 meters</div>
                  <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">Exceptional local knowledge</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">4000+</div>
                  <div className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Excellent</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">50-250 meters</div>
                  <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">Very close guess</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">3000+</div>
                  <div className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Good</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">250m-1km</div>
                  <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">Right neighborhood</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">1000+</div>
                  <div className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Fair</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">1-5 kilometers</div>
                  <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">Correct general area</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">0-999</div>
                  <div className="font-semibold text-red-800 dark:text-red-300 mb-1">Poor</div>
                  <div className="text-sm text-red-600 dark:text-red-400">5+ kilometers</div>
                  <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">Keep practicing!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Tips Section */}
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#00205B] dark:to-[#003566] p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">🏔️ Terrain & Geography Analysis</h3>
               <p className="text-blue-800 dark:text-blue-200 mb-3">
                 Use natural features as your compass. Mountains, coastlines, and terrain can quickly narrow down 
                 possible regions and help you make faster, more accurate guesses.
               </p>
               <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                 <li>• Mountain ranges indicate specific regions</li>
                 <li>• Coastal views suggest proximity to water bodies</li>
                 <li>• Desert/forest terrain narrows location possibilities</li>
               </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-green-900 dark:text-green-100">🏗️ Architectural Style Recognition</h3>
               <p className="text-green-800 dark:text-green-200 mb-3">
                 Different regions have distinct architectural patterns that can quickly identify countries or continents.
               </p>
               <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                 <li>• European style = likely European cities</li>
                 <li>• Asian architecture = East/Southeast Asian regions</li>
                 <li>• Colonial buildings = former colonial territories</li>
               </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
               <h3 className="text-xl font-bold mb-4 text-purple-900 dark:text-purple-100">🌊 Water Bodies & Climate</h3>
               <p className="text-purple-800 dark:text-purple-200 mb-3">
                 Rivers, lakes, and climate clues can quickly identify regions and help you guess faster.
               </p>
               <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                 <li>• Tropical vegetation = equatorial regions</li>
                 <li>• Snow/ice = northern latitudes or high altitude</li>
                 <li>• Arid landscape = desert regions</li>
               </ul>
             </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl">
               <h3 className="text-xl font-bold mb-4 text-red-900 dark:text-red-100">🗼 Landmark Recognition</h3>
               <p className="text-red-800 dark:text-red-200 mb-3">
                 Famous landmarks provide instant location identification when visible in street views.
               </p>
               <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                 <li>• Iconic towers = major city centers</li>
                 <li>• Famous bridges = specific cities</li>
                 <li>• Unique monuments = instant country identification</li>
               </ul>
             </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-xl">
               <h3 className="text-xl font-bold mb-4 text-yellow-900 dark:text-yellow-100">🛣️ Urban Planning Patterns</h3>
               <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                 Different countries have distinct urban planning styles that can quickly identify regions.
               </p>
               <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                 <li>• Grid systems = North American cities</li>
                 <li>• Narrow medieval streets = European old towns</li>
                 <li>• Wide modern boulevards = planned cities</li>
               </ul>
             </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-xl">
               <h3 className="text-xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">⚡ Speed & Time Management</h3>
               <p className="text-indigo-800 dark:text-indigo-200 mb-3">
                 Master time management techniques to make quick, accurate decisions under pressure.
               </p>
               <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                 <li>• Quick scan for obvious clues first</li>
                 <li>• Use elimination method for regions</li>
                 <li>• Trust your first instinct when time is low</li>
               </ul>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#00205B] dark:to-[#001845]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-blue-200 max-w-4xl mx-auto">
              Everything you need to know about playing CalgaryGuessr, from basic gameplay to advanced strategies.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">How many rounds are in each CalgaryGuessr game?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                Each game consists of exactly 5 rounds, providing multiple opportunities to demonstrate your Calgary geography knowledge. 
                This format allows for comprehensive scoring while maintaining an engaging game length that typically takes 10-15 minutes to complete.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Why are street signs and text blurred in the images?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                Sign blurring significantly increases the challenge by preventing players from simply reading street names or business signs. 
                This forces reliance on visual context clues, architectural analysis, and geographical knowledge, making the game more educational 
                and rewarding for those with genuine Calgary familiarity.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Can I play unlimited games on CalgaryGuessr?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                Absolutely! There are no limits on the number of games you can play. Each game features different Calgary locations 
                selected from our extensive database, ensuring fresh challenges and preventing memorization. The more you play, 
                the better you'll become at recognizing Calgary's diverse neighborhoods and landmarks.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Is there a time limit for making guesses?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                No time pressure whatsoever! Take as long as you need to analyze each street scene, study the visual clues, 
                and make your most informed guess. This relaxed approach encourages thoughtful analysis and learning, 
                making CalgaryGuessr both educational and enjoyable for players of all skill levels.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">How accurate and current are the street view images?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                All images are authentic Calgary street scenes sourced from recent street view data, ensuring accuracy and relevance. 
                Our database includes locations from every major Calgary neighborhood, from downtown core to suburban communities, 
                providing a comprehensive representation of the city's diverse geography and urban landscape.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">How can I track my progress and compare scores?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                Visit our comprehensive leaderboard system to view your game history, track score improvements over time, 
                and compare your Calgary geography skills with players worldwide. The leaderboard features daily, weekly, 
                and all-time rankings, plus detailed statistics to help you identify areas for improvement.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">What makes CalgaryGuessr different from other geography games?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                CalgaryGuessr focuses exclusively on Calgary, providing unmatched depth and detail for Canada's energy capital. 
                Our game features local expertise, comprehensive neighborhood coverage, and educational value that helps players 
                genuinely learn about Calgary's geography, history, and urban development patterns.
              </p>
            </div>
            
            <div className="bg-white dark:bg-[#00205B] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Is CalgaryGuessr suitable for educational purposes?</h3>
              <p className="text-gray-600 dark:text-blue-200">
                Definitely! CalgaryGuessr serves as an excellent educational tool for geography classes, local history studies, 
                and urban planning education. Teachers and students can use the game to explore Calgary's development, 
                neighborhood characteristics, and geographical features in an interactive, engaging format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-[#CF142B] to-[#B01226] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Explore Calgary?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of players discovering Calgary's hidden gems and testing their local knowledge. 
            Start your geography adventure today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/game">
              <Button className="bg-white text-[#CF142B] hover:bg-gray-100 text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <Play className="mr-3 h-6 w-6" />
                Start Playing
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#CF142B] text-xl px-12 py-6 rounded-full transition-all duration-300">
                <Trophy className="mr-3 h-6 w-6" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
