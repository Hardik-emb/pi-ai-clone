import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen bg-[#faf3ea]">
      {/* Sidebar */}
      <div className="w-24 border-r border-gray-200 flex flex-col items-center py-4">
        <div className="flex flex-col items-center py-4">
          <div className="p-3 rounded-full hover:bg-gray-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="rgb(13,60,38)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span className="text-xs mt-1 text-[rgb(13,60,38)] font-serif">Discover</span>
        </div>
        
        <div className="flex flex-col items-center py-4 mt-4">
          <div className="p-3 rounded-full hover:bg-gray-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="rgb(13,60,38)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-xs mt-1 text-[rgb(13,60,38)] font-serif">Profile</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-6 text-[rgb(13,60,38)] font-serif">
            py.ai with Claude 3-7 Sonnet
          </h1>
          
          <p className="text-xl mb-8 text-[rgb(13,60,38)] font-serif">
            A powerful AI assistant powered by Anthropic's Claude 3-7 Sonnet model
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-3 text-[rgb(13,60,38)] font-serif">Features</h2>
              <ul className="text-left space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-[rgb(13,60,38)] font-serif">Real-time streaming responses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-[rgb(13,60,38)] font-serif">Markdown and code highlighting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-[rgb(13,60,38)] font-serif">Pi.ai-inspired interface</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Link 
            href="/chat" 
            className="inline-block bg-[#f2e9de] hover:bg-[#e9dfd3] text-[rgb(13,60,38)] font-serif py-3 px-8 rounded-full text-lg transition-colors shadow-sm"
          >
            Start Chatting
          </Link>
          
          <div className="mt-8 text-sm">
            <div className="space-x-4">
              <Link href="/check-env" className="text-[rgb(13,60,38)] font-serif hover:underline">
                Check Environment
              </Link>
              <Link href="/debug" className="text-[rgb(13,60,38)] font-serif hover:underline">
                Debug API
              </Link>
            </div>
          </div>
        </div>
        
        <footer className="mt-16 text-center text-[rgb(13,60,38)] text-sm font-serif">
          <p>Built with Next.js and Anthropic's Claude 3-7 Sonnet</p>
        </footer>
      </div>
    </div>
  );
}
