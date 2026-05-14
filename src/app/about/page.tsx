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
              <CardTitle className="light:text-white">Our Mission & Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At TimeGuessr, our mission is to make geography and history accessible, engaging, and fun for everyone. 
                We believe that learning about the world shouldn't be confined to textbooks. 
                By gamifying the exploration of global locations across different eras, we aim to spark curiosity about our shared human heritage and the diverse landscapes that shape our planet.
              </p>
              <p>
                TimeGuessr challenges you to not only figure out <em>where</em> you are in the world, but <em>when</em> the photo was taken. 
                This unique twist transforms a simple map game into a multidimensional puzzle. 
                Players must analyze a myriad of clues: the style of architecture, the models of cars on the street, the fashion of the pedestrians, and even the quality of the photograph itself.
              </p>
              <p>
                Whether you are a seasoned traveler, a history enthusiast, or someone looking to test their deductive reasoning, 
                TimeGuessr provides an immersive platform to travel the globe and travel through time, all from the comfort of your screen.
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 light:bg-[#00205B] light:text-white light:border-[#001233] light:border-2">
            <CardHeader>
              <CardTitle className="light:text-white">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                TimeGuessr is a comprehensive game that tests your knowledge of global locations and historical timelines. 
                You'll be shown images from around the world, and your task is to guess where the photo was taken and the year it was captured.
              </p>

              <ol className="list-decimal pl-5 space-y-2">
                <li>You'll see a historical or modern street scene from a random global location.</li>
                <li>
                  Use context clues like architecture, landmarks, vehicles, fashion, and photo quality to deduce the location and era.
                </li>
                <li>Click on the interactive map to place your location guess.</li>
                <li>Use the timeline slider to select your guessed year.</li>
                <li>Submit your guess to see how close you were in both distance and time.</li>
                <li>Complete 5 rounds to finish a full game session and get your total score.</li>
              </ol>

              <p>
                The closer your guesses, the more points you'll earn. A perfect location guess (within 50 meters) earns 5000 points. 
                A perfect year guess earns additional bonus points. Points decrease exponentially with distance and time discrepancy.
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 light:bg-[#00205B] light:text-white light:border-[#001233] light:border-2 md:col-span-2">
            <CardHeader>
              <CardTitle className="light:text-white">
                About the Project & Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                TimeGuessr is built using modern web technologies to provide a seamless and interactive experience:
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Google Street View & Maps API</strong> - To provide the core imagery and interactive map interface for location guessing.
                </li>
                <li>
                  <strong>Next.js & React</strong> - Powering our fast, responsive, and SEO-friendly frontend architecture.
                </li>
                <li>
                  <strong>Tailwind CSS</strong> - Ensuring a beautiful, mobile-responsive, and accessible user interface with dark mode support.
                </li>
                <li>
                  <strong>AI-Curated Content</strong> - We leverage artificial intelligence to help curate interesting locations and challenging historical photos.
                </li>
              </ul>

              <p className="mt-4">
                The game features thousands of hand-picked and AI-verified locations across all continents. 
                From the bustling streets of modern Tokyo to historical archival photos of 1950s New York, 
                every round is a new opportunity to learn and explore.
              </p>
              <p>
                We are constantly updating our database with new locations and refining our scoring algorithms to ensure a fair and competitive environment for our global leaderboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  );
}
