'use client';

import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface AnimatedMessageProps {
  text: string;
}

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ text }) => {
  // If text is empty, return nothing
  if (!text.trim()) {
    return null;
  }
  
  // Track which chunk is currently being animated
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  
  // Split text into chunks, preserving markdown structure
  const chunks = useMemo(() => {
    // First, detect if there are tables in the text
    const hasTable = text.includes('|') && text.includes('\n|');
    
    // If there's a table, we need to be more careful with splitting
    if (hasTable) {
      // Split by sections that might contain tables
      const sections = text.split(/(?=#+\s|(?:\n\n|\r\n\r\n))/);
      const result: string[] = [];
      
      sections.forEach(section => {
        // Check if this section contains a table
        if (section.includes('|') && section.includes('\n|')) {
          // Keep table sections intact
          result.push(section);
        } else if (section.trim().match(/^[-*+] /m) || section.trim().match(/^\d+\. /m)) {
          // This is a list, keep it as one chunk
          result.push(section);
        } else if (section.trim().startsWith('#')) {
          // This is a heading, keep it as one chunk
          result.push(section);
        } else if (section.length > 200) {
          // Long paragraph, split into smaller chunks by sentences
          const sentences = section.split(/(?<=[.!?])\s+/);
          let currentChunk = '';
          
          sentences.forEach(sentence => {
            if (currentChunk.length + sentence.length > 200 && currentChunk.length > 0) {
              result.push(currentChunk);
              currentChunk = sentence;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
          });
          
          if (currentChunk) {
            result.push(currentChunk);
          }
        } else {
          // Regular paragraph, keep as is
          result.push(section);
        }
      });
      
      return result.length > 0 ? result : [text];
    } else {
      // No tables, use the original splitting logic
      const paragraphs = text.split(/\n\s*\n/);
      const result: string[] = [];
      
      paragraphs.forEach(paragraph => {
        // Check if this is a list
        if (paragraph.trim().match(/^[-*+] /m)) {
          // This is a list, keep it as one chunk
          result.push(paragraph);
        } else if (paragraph.trim().match(/^\d+\. /m)) {
          // This is a numbered list, keep it as one chunk
          result.push(paragraph);
        } else if (paragraph.trim().startsWith('#')) {
          // This is a heading, keep it as one chunk
          result.push(paragraph);
        } else if (paragraph.length > 200) {
          // Long paragraph, split into smaller chunks by sentences
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          let currentChunk = '';
          
          sentences.forEach(sentence => {
            if (currentChunk.length + sentence.length > 200 && currentChunk.length > 0) {
              result.push(currentChunk);
              currentChunk = sentence;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
          });
          
          if (currentChunk) {
            result.push(currentChunk);
          }
        } else {
          // Regular paragraph, keep as is
          result.push(paragraph);
        }
      });
      
      return result.length > 0 ? result : [text];
    }
  }, [text]);
  
  return (
    <div className="space-y-4">
      {chunks.map((chunk, i) => (
        <motion.div
          key={i}
          id={`chunk-${i}`}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: i * 0.2, // Much shorter delay between chunks
            ease: "easeOut" 
          }}
          onAnimationStart={() => {
            // Update the current chunk index when animation starts
            if (i > currentChunkIndex) {
              setCurrentChunkIndex(i);
              
              // Scroll to this chunk
              const element = document.getElementById(`chunk-${i}`);
              if (element) {
                element.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'nearest'
                });
              }
            }
          }}
          className="min-h-[1.2em] p-2 border-l-4 border-transparent hover:border-[#B8A18F] pl-3 transition-colors"
        >
          <div className="prose prose-sm max-w-none prose-p:font-serif prose-p:text-[rgb(13,60,38)] prose-p:text-[22px] prose-li:font-serif prose-li:text-[rgb(13,60,38)] prose-li:text-[22px] prose-table:font-serif prose-table:text-[rgb(13,60,38)] prose-table:text-[18px]">
            <ReactMarkdown 
              rehypePlugins={[rehypeHighlight]}
              remarkPlugins={[remarkGfm]} // Add GitHub Flavored Markdown support for tables
            >
              {chunk}
            </ReactMarkdown>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedMessage;
