import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="bg-white text-[#00205B] shadow-md dark:bg-[#00205B] dark:text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="TimeGuessr Logo" 
              width={48} 
              height={48}
              className="h-10 w-10"
            />
            <strong className="text-xl font-bold">TimeGuessr</strong>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6">
            <Link
              href="/game"
              className="transition-colors hover:text-[#CF142B] dark:hover:text-[#CF142B]"
            >
              Play
            </Link>
            <Link
              href="/leaderboard"
              className="transition-colors hover:text-[#CF142B] dark:hover:text-[#CF142B]"
            >
              Leaderboard
            </Link>
            {/* <Link
              href="/about"
              className="transition-colors hover:text-[#CF142B] dark:hover:text-[#CF142B]"
            >
              About
            </Link> */}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
