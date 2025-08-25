import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - TimeGuessr",
  description: "Get in touch with the TimeGuessr team - We're here to help with questions, feedback, and support for our geography guessing game.",
  robots: "index, follow",
};

export default function ContactUs() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        <p className="text-xl text-gray-600 dark:text-blue-200 text-center mb-12">
          We'd love to hear from you! Get in touch with any questions, feedback, or suggestions.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="bg-gray-50 dark:bg-[#00205B] p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#001845] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CF142B] bg-white dark:bg-[#001233] text-black dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#001845] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CF142B] bg-white dark:bg-[#001233] text-black dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#001845] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CF142B] bg-white dark:bg-[#001233] text-black dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#001845] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CF142B] bg-white dark:bg-[#001233] text-black dark:text-white"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  placeholder="Tell us how we can help you..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#001845] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CF142B] bg-white dark:bg-[#001233] text-black dark:text-white resize-vertical"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#CF142B] text-white py-3 px-6 rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-gray-50 dark:bg-[#00205B] p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-[#CF142B] mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-blue-200">contact@timeguessr.com</p>
                    <p className="text-sm text-gray-500 dark:text-blue-300">We typically respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-[#CF142B] mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">Address</h3>
                    <p className="text-gray-600 dark:text-blue-200">
                      TimeGuessr Team<br />
                      [Your Address]<br />
                      [City, State, ZIP]<br />
                      [Country]
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#CF142B] mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">Support Hours</h3>
                    <p className="text-gray-600 dark:text-blue-200">
                      Monday - Friday: 9:00 AM - 6:00 PM (UTC)<br />
                      Saturday - Sunday: 10:00 AM - 4:00 PM (UTC)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gray-50 dark:bg-[#00205B] p-8 rounded-lg">
              <div className="flex items-start gap-4">
                <MessageCircle className="h-6 w-6 text-[#CF142B] mt-1" />
                <div>
                  <h3 className="font-medium mb-2">Quick Answers</h3>
                  <p className="text-gray-600 dark:text-blue-200 mb-4">
                    Looking for immediate help? Check our Help Center for answers to common questions.
                  </p>
                  <a 
                    href="/help" 
                    className="inline-block bg-[#CF142B] text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Visit Help Center
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-50 dark:bg-[#00205B] p-8 rounded-lg">
              <h3 className="font-medium mb-4">Follow Us</h3>
              <p className="text-gray-600 dark:text-blue-200 mb-4">
                Stay updated with the latest news and updates from TimeGuessr.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://twitter.com/timeguessr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#CF142B] hover:text-red-700 transition-colors"
                >
                  Twitter
                </a>
                <a 
                  href="https://github.com/timeguessr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#CF142B] hover:text-red-700 transition-colors"
                >
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com/company/timeguessr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#CF142B] hover:text-red-700 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}