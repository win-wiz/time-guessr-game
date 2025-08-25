import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - TimeGuessr",
  description: "Privacy Policy for TimeGuessr - Learn how we collect, use, and protect your personal information while playing our geography guessing game.",
  robots: "index, follow",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-blue-200 mb-8 text-center">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-700 dark:text-blue-100">
              <h3 className="text-xl font-medium">1.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (username, email address)</li>
                <li>Game scores and statistics</li>
                <li>User preferences and settings</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-medium mt-6">1.2 Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, game interactions)</li>
                <li>IP address and general location information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain the TimeGuessr game service</li>
                <li>Track your game progress and maintain leaderboards</li>
                <li>Personalize your gaming experience</li>
                <li>Communicate with you about updates and new features</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Public Leaderboards:</strong> Your username and scores may be displayed on public leaderboards</li>
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Object to certain processing activities</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                TimeGuessr is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> support@timeguessr.online </li>
                {/* <li><strong>Address:</strong> TimeGuessr Team, [Your Address]</li> */}
              </ul>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}