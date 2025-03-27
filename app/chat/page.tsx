'use client';

import { useRef, useEffect, useState, FormEvent, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import Link from 'next/link';
import ChunkedStreamingText from '../components/ChunkedStreamingText';

interface Message {
  role: string;
  content: string;
  id?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handle form submission with streaming
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to the chat
    const userMessage = { role: 'user', content: input, id: Date.now().toString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create a placeholder for the assistant's response
    // Use a timestamp 1 second in the future to ensure it's unique
    const assistantMessageId = (Date.now() + 1000).toString();
    setMessages(currentMessages => [
      ...currentMessages,
      { 
        role: 'assistant', 
        content: '', 
        id: assistantMessageId
      }
    ]);

    try {
      // Send the request to the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a response');
      }

      // Check if the response is a stream
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/plain')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Failed to get response reader');
        
        let assistantResponse = '';
        
        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and append to the assistant's response
          const chunk = new TextDecoder().decode(value);
          console.log("Received chunk:", chunk);
          
          // Filter out any 'undefined' strings
          if (chunk !== 'undefined') {
            assistantResponse += chunk;
          }
          
          // Update the assistant's message with the accumulated response
          setMessages(currentMessages => {
            const updatedMessages = [...currentMessages];
            const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
            
            if (assistantMessageIndex !== -1) {
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                content: assistantResponse
              };
            }
            
            return updatedMessages;
          });
          
          // Scroll to bottom as new content arrives
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Handle non-streaming response
        const data = await response.json();
        
        // Update the assistant's message with the complete response
        setMessages(currentMessages => {
          const updatedMessages = [...currentMessages];
          const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
          
          if (assistantMessageIndex !== -1) {
            updatedMessages[assistantMessageIndex] = {
              ...updatedMessages[assistantMessageIndex],
              content: data.response
            };
          }
          
          return updatedMessages;
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      
      // Remove the placeholder message if there was an error
      setMessages(currentMessages => 
        currentMessages.filter(m => m.id !== assistantMessageId)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Add a system message at the beginning if there are no messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'system-1',
          role: 'system',
          content: 'You are Claude 3-7 Sonnet, a helpful AI assistant. Respond in a clear, concise, and friendly manner.'
        }
      ]);
    }
  }, [messages.length, setMessages]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when user messages change
  useEffect(() => {
    // Only scroll to bottom for user messages or when there's an error
    // (AnimatedMessage component handles its own scrolling)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error("Chat error:", error);
    }
  }, [error]);

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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Volume control icon in top right */}
        <div className="absolute top-4 right-4 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="rgb(13,60,38)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="max-w-3xl mx-auto">
            {messages.filter((m: Message) => m.role !== 'system').length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[rgb(13,60,38)] font-serif text-[22px] animate-fade-in">
                  Start a conversation
                </p>
              </div>
            ) : (
              <div>
                {/* Debug info removed */}
                
                {messages
                  .filter((message: Message) => message.role !== 'system')
                  .map((message: Message, i: number) => (
                    <div
                      key={`${message.role}-${i}-${message.id || Date.now()}`}
                      className={`flex mb-6 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      } ${message.role === 'user' ? 'user-animation' : ''}`}
                      style={{
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      {message.role === 'user' ? (
                        <div className="max-w-xl p-4 rounded-lg font-serif text-[rgb(13,60,38)] text-[22px] bg-[#F5EADC]">
                          <div>{message.content}</div>
                        </div>
                      ) : (
                        <div className="max-w-xl p-4 rounded-lg font-serif text-[rgb(13,60,38)] text-[22px] bg-transparent">
                          <div className="prose prose-sm max-w-none prose-p:font-serif prose-p:text-[rgb(13,60,38)] prose-p:text-[22px]">
                            {message.content === '' && isLoading ? (
                              <div className="flex space-x-2 items-center">
                                <div className="w-2 h-2 bg-[#B8A18F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-[#B8A18F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-[#B8A18F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            ) : message.content ? (
                              <ChunkedStreamingText text={message.content} speed={300} />
                            ) : (
                              <div>{message.content}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
            {error && (
              <div 
                className="flex justify-center"
                style={{
                  animation: 'slideUpFade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}
              >
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  Error: {error.message || "Something went wrong"}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input and Terms */}
        <div 
          className="p-4 space-y-2"
          style={{
            animation: 'slideUpFade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            animationDelay: '0.3s'
          }}
        >
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Talk with Pi"
              className="w-full border-0 hover:border hover:border-[#B8A18F] rounded-full py-3 px-5 pr-12 outline-none font-serif text-[#B8A18F] text-[22px] bg-[#FCFAF7] shadow-md hover:shadow-none hover:translate-y-0 translate-y-[-2px] transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(13,60,38)] hover:text-[rgb(13,60,38)] disabled:opacity-50 hover:scale-110 active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="rgb(13,60,38)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          
          <div className="text-center text-xs text-[rgb(13,60,38)] max-w-xl mx-auto font-serif ">
            Pi may make mistakes, please don't rely on its information.
          </div>
        </div>
      </div>
    </div>
  );
}
