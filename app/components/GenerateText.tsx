'use client';

import { useState, useEffect, useRef } from 'react';

interface GenerateTextProps {
  text: string;
}

const GenerateText: React.FC<GenerateTextProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevTextRef = useRef('');
  
  useEffect(() => {
    // If the text is the same as before, don't regenerate
    if (text === prevTextRef.current) {
      return;
    }
    
    // If the text is empty, reset
    if (!text) {
      setDisplayedText('');
      prevTextRef.current = '';
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
    const speed = 10; // ms per character
    
    intervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, speed);
    
    // Update the previous text
    prevTextRef.current = text;
    
    // Clean up
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text]);
  
  return <span>{displayedText}</span>;
};

export default GenerateText;
