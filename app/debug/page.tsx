'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Debug() {
  const [apiResponse, setApiResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hello, can you respond with a short greeting?' }
          ]
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }
      
      // Check if the response is a stream
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/event-stream')) {
        setApiResponse('Received a streaming response. This is good!');
        
        // Create a new response to clone the original one
        // This avoids the "body stream already read" error
        const clonedResponse = response.clone();
        
        // Read the stream
        const reader = clonedResponse.body?.getReader();
        if (reader) {
          let receivedText = '';
          let messageCount = 0;
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // Convert the Uint8Array to a string
              const chunk = new TextDecoder().decode(value);
              receivedText += chunk;
              
              // Count SSE messages
              const matches = chunk.match(/data:/g);
              if (matches) {
                messageCount += matches.length;
              }
              
              // Update the response with stats
              setApiResponse(
                `Streaming response:\n` +
                `- Received ${receivedText.length} bytes\n` +
                `- Detected ${messageCount} SSE messages\n` +
                `- First 100 chars: ${receivedText.substring(0, 100)}...`
              );
            }
          } catch (streamError: any) {
            console.error('Error reading stream:', streamError);
            setApiResponse(`Error reading stream: ${streamError.message || 'Unknown error'}`);
          } finally {
            reader.releaseLock();
          }
        }
      } else {
        // For non-streaming responses
        try {
          // Clone the response to avoid "body stream already read" error
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          setApiResponse(`Non-streaming JSON response: ${JSON.stringify(data)}`);
        } catch (jsonError) {
          // If it's not valid JSON, try to get it as text
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          setApiResponse(`Non-streaming text response: ${text}`);
        }
      }
    } catch (err) {
      console.error('Error testing API:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-6">API Debug</h1>
          
          <div className="mb-6">
            <button
              onClick={testApi}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Testing API...' : 'Test API'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {apiResponse && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">API Response:</h2>
              <div className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap">{apiResponse}</pre>
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Troubleshooting Tips:</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Make sure your ANTHROPIC_API_KEY is set in .env.local</li>
              <li>Check that the API key is valid and has access to Claude 3-7 Sonnet</li>
              <li>Verify that the API route is correctly configured to stream responses</li>
              <li>Check browser console for any JavaScript errors</li>
              <li>Look at the server logs for any backend errors</li>
            </ul>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Link href="/" className="text-blue-500 hover:underline">
              Back to Home
            </Link>
            <Link href="/check-env" className="text-blue-500 hover:underline">
              Check Environment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
