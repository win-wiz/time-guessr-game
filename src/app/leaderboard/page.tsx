import Header from "@/components/Header";

export default function Leaderboard() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground dark:bg-gray-900 light:bg-gray-100">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white light:text-[#00205B]">
          Leaderboard
        </h1>
        <div className="bg-white dark:bg-gray-800 light:bg-[#00205B] light:text-white light:border-[#001233] light:border-2 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white light:text-white mb-2">
               Leaderboard Feature in Development
             </h3>
             <p className="text-gray-500 dark:text-gray-400 light:text-gray-300 mb-6">
               We are working hard to develop the leaderboard feature. Stay tuned!
             </p>
             <div className="bg-blue-50 dark:bg-blue-900/20 light:bg-blue-900/30 border border-blue-200 dark:border-blue-800 light:border-blue-700 rounded-lg p-4">
               <p className="text-sm text-blue-700 dark:text-blue-300 light:text-blue-200">
                 💡 Tip: You can start by playing the exciting time guessing game to accumulate scores, then come back to check your ranking!
               </p>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
