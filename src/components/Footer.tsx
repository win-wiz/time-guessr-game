import { Mail, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { memo } from "react";

export interface FooterProps {
  companyName?: string;
  email?: string;
  socialLinks?: {
    github?: string;
    // twitter?: string;
    // linkedin?: string;
  };
  showSocialLinks?: boolean;
  customLinks?: Array<{
    href: string;
    label: string;
    external?: boolean;
  }>;
}

const Footer = memo(({ 
  companyName = "TimeGuessr Team",
  email = "support@timeguessr.online",
  socialLinks = {
    github: "https://github.com/win-wiz/time-guessr-game",
    // twitter: "https://twitter.com/timeguessr",
    // linkedin: "https://linkedin.com/company/timeguessr"
  },
  showSocialLinks = true,
  customLinks = []
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-[#00205B] border-t border-gray-200 dark:bg-[#00205B] dark:text-white dark:border-[#001845]">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2">
                <Image 
                  src="/logo.svg" 
                  alt="TimeGuessr Logo" 
                  width={48} 
                  height={48}
                  className="h-8 w-8"
                />
                <strong className="text-xl font-bold">TimeGuessr</strong>
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-blue-200 mb-4">
              The ultimate geography guessing game. Test your world knowledge with street view challenges and compete with players worldwide.
            </p>
            {email && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-blue-200">
                <Mail className="h-4 w-4" />
                <a 
                  href={`mailto:${email}`}
                  className="hover:text-[#CF142B] transition-colors"
                >
                  {email}
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/game" 
                  className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                >
                  Play Game
                </Link>
              </li>
              <li>
                <Link 
                  href="/leaderboard" 
                  className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              {/* <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                >
                  About
                </Link>
              </li> */}
              {customLinks.map((link, index) => (
                <li key={index}>
                  {link.external ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      href={link.href}
                      className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Support</h3>
            <ul className="space-y-2 text-sm">
              {/* <li>
                <Link 
                  href="/help" 
                  className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                >
                  Help Center
                </Link>
              </li> */}
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              {/* <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                >
                  Contact Us
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Social Links */}
          {showSocialLinks && (
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-blue-200 hover:text-[#CF142B] transition-colors"
                    aria-label="GitHub"
                  >
                    <svg className="h-6 dark:fill-white fill-black" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5808 20.2773 21.0498 21.7438 19.0074C23.2103 16.9651 23.9994 14.5143 24 12C24 5.37 18.63 0 12 0Z"></path>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-[#001845] pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-blue-200">
              © {currentYear} {companyName}. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-blue-200">
              <span>Made with ❤️ for geography enthusiasts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;