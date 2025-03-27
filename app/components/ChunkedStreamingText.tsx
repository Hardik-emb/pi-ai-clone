'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ChunkedStreamingTextProps {
  text: string;
  speed?: number;
}

const ChunkedStreamingText: React.FC<ChunkedStreamingTextProps> = ({ 
  text, 
  speed = 300 
}) => {
  const [currentChunks, setCurrentChunks] = useState<string[]>([]);
  
  // Split text into chunks of 5-10 words
  const splitIntoChunks = (text: string): string[] => {
    if (!text) return [];
    
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      currentChunk.push(words[i]);
      
      // Random chunk size between 5-10 words
      const chunkSize = Math.floor(Math.random() * 6) + 5; // 5-10
      
      if (currentChunk.length >= chunkSize || i === words.length - 1) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    }
    
    return chunks;
  };
  
  // Effect to stream chunks
  useEffect(() => {
    // Reset chunks when text changes
    setCurrentChunks([]);
    
    if (!text) return;
    
    const chunks = splitIntoChunks(text);
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < chunks.length) {
        setCurrentChunks(prev => [...prev, chunks[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);
  
  // If text is empty, return a waiting message
  if (!text || text.trim() === '') {
    return <div>Waiting for response...</div>;
  }
  
  return (
    <div className="font-serif text-[rgb(13,60,38)] text-[22px]">
      <div className="inline">
        {currentChunks.map((chunk, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mr-1"
            style={{ display: 'inline' }}
          >
            {chunk}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

export default ChunkedStreamingText;
