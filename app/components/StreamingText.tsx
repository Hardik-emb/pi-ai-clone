'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface StreamingTextProps {
  text: string;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevTextRef = useRef('');
  
  // Effect to update the displayed text when the input text changes
  useEffect(() => {
    // If the text is empty, reset everything
    if (!text) {
      setDisplayedText('');
      prevTextRef.current = '';
      return;
    }
    
    // If the text is the same as before, don't regenerate
    if (text === prevTextRef.current) {
      return;
    }
    
    // If the new text starts with the old text, only generate the new part
    let startIndex = 0;
    if (text.startsWith(prevTextRef.current)) {
      startIndex = prevTextRef.current.length;
      setDisplayedText(prevTextRef.current);
    } else {
      // Otherwise, start from the beginning
      setDisplayedText('');
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Generate the text character by character
    let currentIndex = startIndex;
    const speed = 15; // ms per character
    
    // Use a batch size to update multiple characters at once
    // This makes the animation smoother by reducing the number of renders
    const batchSize = 1; // characters per batch
    
    intervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        // Calculate the end index for this batch
        const endIndex = Math.min(currentIndex + batchSize, text.length);
        
        // Update the displayed text with the new batch
        setDisplayedText(text.substring(0, endIndex));
        
        // Move the index to the end of the batch
        currentIndex = endIndex;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, speed);
    
    // Update the previous text ref
    prevTextRef.current = text;
    
    // Clean up
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text]);
  
  // Scroll to bottom as text is added
  useEffect(() => {
    // Use requestAnimationFrame to ensure the DOM has updated before scrolling
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    });
  }, [displayedText]);
  
  // If text is empty, return nothing
  if (!text || text.trim() === '') {
    return <div>Waiting for response...</div>;
  }
  
  return (
    <div className="prose prose-sm max-w-none prose-p:font-serif prose-p:text-[rgb(13,60,38)] prose-p:text-[22px] prose-li:font-serif prose-li:text-[rgb(13,60,38)] prose-li:text-[22px] prose-table:font-serif prose-table:text-[rgb(13,60,38)] prose-table:text-[18px]">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
      >
        {displayedText}
      </ReactMarkdown>
    </div>
  );
};

export default StreamingText;
