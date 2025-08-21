"use client";

import { memo } from "react";

interface BackgroundImageProps {
  imageUrl: string;
}

export const BackgroundImage = memo(function BackgroundImage({ imageUrl }: BackgroundImageProps) {
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none" 
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(5px)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/25 pointer-events-none"></div>
    </div>
  );
});