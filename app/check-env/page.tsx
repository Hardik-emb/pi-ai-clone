'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CheckEnv() {
  const [envStatus, setEnvStatus] = useState<{ anthropicApiKey: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkEnv() {
      try {
        const response = await fetch('/api/check-env');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEnvStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    checkEnv();
  }, []);

  return (
    <div className="flex h-screen bg-[#faf6f1]">
      {/* Sidebar */}
      <div className="w-24 border-r border-gray-200 flex flex-col items-center py-4">
        <div className="flex flex-col items-center py-4 text-gray-700">
          <div className="p-3 rounded-full hover:bg-gray-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className="text-xs mt-1">Discover</span>
        </div>
        
        <div className="flex flex-col items-center py-4 text-gray-700 mt-4">
          <div className="p-3 rounded-full hover:bg-gray-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-xs mt-1">Profile</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Environment Check</h1>
          
          {loading ? (
            <p>Loading environment status...</p>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border p-4 rounded">
                <h2 className="font-semibold mb-2">ANTHROPIC_API_KEY</h2>
                <p className={envStatus?.anthropicApiKey === 'Not set' ? 'text-red-600' : 'text-green-600'}>
                  Status: {envStatus?.anthropicApiKey}
                </p>
                {envStatus?.anthropicApiKey === 'Not set' && (
                  <p className="text-sm mt-2 text-gray-600">
                    You need to set the ANTHROPIC_API_KEY in your .env.local file for the application to work.
                  </p>
                )}
              </div>
              
              <div className="mt-6">
                <h2 className="font-semibold mb-2">Next Steps</h2>
                {envStatus?.anthropicApiKey === 'Not set' ? (
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Create a .env.local file in the root directory</li>
                    <li>Add your Anthropic API key: <code className="bg-gray-100 px-1 py-0.5 rounded">ANTHROPIC_API_KEY=your_api_key_here</code></li>
                    <li>Restart the development server</li>
                  </ol>
                ) : (
                  <p className="text-green-600">All required environment variables are set!</p>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <Link href="/" className="text-blue-500 hover:underline">
              Back to Home
            </Link>
            <Link href="/chat" className="text-blue-500 hover:underline">
              Go to Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
