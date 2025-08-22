import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Trophy } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="bg-red-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Explore Calgary?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of players discovering Calgary's hidden gems and testing
          their local knowledge. Start your geography adventure today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/game">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full transition-colors duration-200"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Playing
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-8 py-3 rounded-full transition-colors duration-200"
            >
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}