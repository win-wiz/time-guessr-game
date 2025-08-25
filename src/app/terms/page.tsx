import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - TimeGuessr",
  description: "Terms of Service for TimeGuessr - Read our terms and conditions for using our geography guessing game platform.",
  robots: "index, follow",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-blue-200 mb-8 text-center">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                By accessing and using TimeGuessr ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                TimeGuessr is an online geography guessing game that challenges players to identify locations based on street view imagery. The service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interactive geography guessing gameplay</li>
                <li>Global leaderboards and scoring systems</li>
                <li>User accounts and progress tracking</li>
                <li>Educational content about world geography</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <h3 className="text-xl font-medium mb-3">3.1 Account Creation</h3>
              <p className="mb-4">
                To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h3 className="text-xl font-medium mb-3">3.2 Account Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use automated scripts or bots to play the game</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious code or viruses</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Game Rules and Fair Play</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <h3 className="text-xl font-medium mb-3">5.1 Fair Play Policy</h3>
              <p className="mb-4">
                TimeGuessr is designed to be a fair and enjoyable experience for all players. We prohibit:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Using external tools or software to gain unfair advantages</li>
                <li>Sharing answers or coordinating with other players during games</li>
                <li>Creating multiple accounts to manipulate leaderboards</li>
                <li>Any form of cheating or exploitation of game mechanics</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">5.2 Consequences</h3>
              <p className="mb-4">
                Violations may result in account suspension, score resets, or permanent bans at our discretion.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                The TimeGuessr service, including its design, functionality, and content, is owned by TimeGuessr Team and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="mb-4">
                Street view imagery is provided by third-party services and remains the property of their respective owners.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                The service is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </p>
              <p className="mb-4">
                We are not responsible for the accuracy of geographic information or street view imagery provided by third-party services.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                To the maximum extent permitted by law, TimeGuessr Team shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                We may terminate or suspend your account and access to the service at any time, with or without cause, with or without notice.
              </p>
              <p className="mb-4">
                You may terminate your account at any time by contacting us or using the account deletion feature.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the updated terms on this page and updating the "Last updated" date.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">
                These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <div className="text-gray-700 dark:text-blue-100">
              <p className="mb-4">If you have any questions about these Terms of Service, please contact us:</p>
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