import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Image
            src="/logo.svg"
            alt="TimeGuessr Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <h1 className="text-3xl font-bold dark:text-white light:text-[#00205B]">
            About TimeGuessr
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="dark:bg-gray-800 light:bg-[#00205B] light:text-white light:border-[#001233] light:border-2">
            <CardHeader>
              <CardTitle className="light:text-white">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                TimeGuessr is a game that tests your knowledge of Calgary's
                streets and neighborhoods. You'll be shown images from around
                the city, and your task is to guess where the photo was taken.
              </p>

              <ol className="list-decimal pl-5 space-y-2">
                <li>You'll see a Calgary street scene</li>
                <li>
                  Use context clues like architecture, landmarks, and
                  surroundings to guess the location
                </li>
                <li>Click on the map to place your guess</li>
                <li>Submit your guess to see how close you were</li>
                <li>Score is based on distance from actual location</li>
                <li>Complete 5 rounds to finish a game</li>
              </ol>

              <p>
                The closer your guess, the more points you'll earn. A perfect
                guess (within 100 meters) earns 5000 points. Points decrease
                with distance, and guesses more than 2km away earn 0 points.
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 light:bg-[#00205B] light:text-white light:border-[#001233] light:border-2">
            <CardHeader>
              <CardTitle className="light:text-white">
                About the Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This project uses several technologies to create an engaging
                geographic guessing game:
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Google Street View API</strong> - To collect
                  street-level imagery from around Calgary
                </li>
                {/* <li>
                  <strong>YOLO Object Detection</strong> - To automatically detect and blur street signs
                </li> */}
                <li>
                  <strong>Next.js</strong> - For the web application framework
                </li>
                <li>
                  <strong>Google Maps</strong> - For the interactive map
                  interface
                </li>
              </ul>

              <p className="mt-4">
                The game focuses on downtown Calgary and surrounding
                neighborhoods, including Chinatown, Eau Claire, Kensington,
                Crescent Heights, East Village, Sunnyside and Beltline.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  );
}
