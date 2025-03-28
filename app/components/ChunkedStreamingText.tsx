'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface ChunkedStreamingTextProps {
  text: string;
  speed?: number;
}

const ChunkedStreamingText: React.FC<ChunkedStreamingTextProps> = ({ 
  text, 
  speed = 300 
}) => {
  const [currentChunks, setCurrentChunks] = useState<string[]>([]);
  
  // Split text into chunks that respect sentence boundaries and punctuation
  const splitIntoChunks = (text: string): string[] => {
    if (!text) return [];
    
    // First, split by sentence endings (., !, ?)
    // This regex matches sentence endings while keeping the punctuation
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const matches = text.match(sentenceRegex);
    const sentences = matches || [text];
    
    const chunks: string[] = [];
    
    sentences.forEach(sentence => {
      sentence = sentence.trim();
      
      // If sentence is short enough, keep it as one chunk
      if (sentence.split(/\s+/).length <= 10) {
        chunks.push(sentence);
        return;
      }
      
      // For longer sentences, try to split at natural breaking points
      const subSentences = sentence.split(/([,;:])/);
      let currentChunk: string[] = [];
      let currentLength = 0;
      
      for (let i = 0; i < subSentences.length; i++) {
        const part = subSentences[i];
        const words = part.trim().split(/\s+/).filter(w => w.length > 0);
        
        // If adding this part would make the chunk too long, push current chunk and start a new one
        if (currentLength + words.length > 10 && currentLength > 0) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [];
          currentLength = 0;
        }
        
        // Add this part to the current chunk
        if (words.length > 0) {
          currentChunk.push(part.trim());
          currentLength += words.length;
        }
        
        // If this part ends with punctuation, it's a good place to end the chunk
        if (part.match(/[,;:]$/)) {
          if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
            currentLength = 0;
          }
        }
      }
      
      // Add any remaining parts
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
      }
    });
    
    // Handle any text that wasn't matched by the sentence regex
    // (this can happen with lists, code blocks, etc.)
    if (chunks.length === 0) {
      // Fall back to the original chunking method
      const words = text.split(/\s+/);
      let currentChunk: string[] = [];
      
      for (let i = 0; i < words.length; i++) {
        currentChunk.push(words[i]);
        
        // Use a consistent chunk size of 8 words for fallback
        if (currentChunk.length >= 8 || i === words.length - 1) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [];
        }
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
    <div className="prose prose-sm max-w-none prose-p:font-serif prose-p:text-[rgb(13,60,38)] prose-p:text-[22px] prose-li:font-serif prose-li:text-[rgb(13,60,38)] prose-li:text-[22px] prose-table:font-serif prose-table:text-[rgb(13,60,38)] prose-table:text-[18px]">
      <div className="inline">
        {currentChunks.map((chunk, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mr-1"
            style={{ display: 'inline-block' }}
          >
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              remarkPlugins={[remarkGfm]}
            >
              {chunk}
            </ReactMarkdown>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChunkedStreamingText;
