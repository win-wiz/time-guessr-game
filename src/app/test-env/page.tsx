"use client";

import { useEffect, useState } from "react";

export default function TestEnv() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test environment variables
    const vars = {
      FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    };
    setEnvVars(vars);

    // Test Firebase connection
    try {
      import('@/lib/firebase').then((firebase) => {
        console.log('Firebase initialized:', firebase.db);
      }).catch((err) => {
        setError(`Firebase error: ${err.message}`);
      });
    } catch (err) {
      setError(`Import error: ${err}`);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="mb-2">
            <strong>{key}:</strong> {value ? '✅ Set' : '❌ Not set'}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check if environment variables are properly set</li>
          <li>Open browser console (F12) to see detailed error messages</li>
          <li>Configure .env.local with your actual API keys</li>
        </ol>
      </div>
    </div>
  );
}