'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedCharactersProps {
  text: string;
}

const AnimatedCharacters: React.FC<AnimatedCharactersProps> = ({ text }) => {
  const [visibleChars, setVisibleChars] = useState<number>(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef<boolean>(true);
  
  // Log the text for debugging
  useEffect(() => {
    console.log("AnimatedCharacters received:", text);
  }, [text]);
  
  // If text is empty, return nothing
  if (!text || text.trim() === '') {
    return <span>...</span>;
  }
  
  // Effect to animate characters
  useEffect(() => {
    // On first render, show all characters immediately
    if (isFirstRender.current) {
      setVisibleChars(text.length);
      isFirstRender.current = false;
      return;
    }
    
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    // Start with no characters visible
    setVisibleChars(0);
    
    // Animate characters one by one
    let charIndex = 0;
    const animationInterval = 20; // ms between characters
    
    animationRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setVisibleChars(charIndex + 1);
        charIndex++;
      } else {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      }
    }, animationInterval);
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [text]);
  
  return (
    <span>
      {text.split('').map((char, index) => (
        <span
          key={`${index}-${char}`}
          style={{
            opacity: index < visibleChars ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default AnimatedCharacters;
