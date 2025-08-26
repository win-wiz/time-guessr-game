"use client";

import { Card } from "@/components/ui/card"
import { useState, useRef, useEffect, memo, useMemo, useCallback } from "react"

interface GameImageProps {
  imageUrl: string
  eventName?: string
}

export const GameImage = memo(function GameImage({ imageUrl, eventName }: GameImageProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // console.log('imgUrl ======>>>', imageUrl);
  // console.log('eventName ======>>>', eventName);
  // console.log('GameImage props:', { imageUrl, eventName });
  // Memoize image source and alt text
  const imageSrc = useMemo(() => imageUrl || "/placeholder.svg", [imageUrl])
  const imageAlt = useMemo(() => eventName || "Historical event image", [eventName])

  // Memoize transform style to prevent unnecessary recalculations
  const transformStyle = useMemo(() => ({
    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
    transformOrigin: 'center center'
  }), [scale, position.x, position.y])

  // Memoize zoom hint text
  const zoomHintText = useMemo(() => {
    return `Scroll to zoom • ${scale > 1 ? 'Drag to move' : 'Zoom to view details'}`
  }, [scale])

  // Memoize whether to show reset button
  const showResetButton = useMemo(() => scale !== 1, [scale])

  // Add global wheel event listener to prevent page scrolling when scrolling in image area
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault()
      }
    }

    // Use passive: false to ensure preventDefault can be called
    document.addEventListener('wheel', handleGlobalWheel, { passive: false })
    
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel)
    }
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Only handle zoom when mouse is inside the image container
    if (!containerRef.current?.contains(e.target as Node)) {
      return
    }
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(3, scale * delta))
    
    // Constraint when zooming out: reset position when zooming close to original size
    if (newScale <= 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(newScale)
    }
  }, [scale])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }, [scale, position.x, position.y])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, scale, dragStart.x, dragStart.y])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  return (
    <Card className="h-full overflow-hidden bg-transparent rounded-2xl p-1 border border-white/20 shadow-lg">
      <div 
        ref={containerRef}
        className="relative h-full w-full cursor-grab active:cursor-grabbing flex items-center justify-center rounded-xl overflow-hidden bg-transparent"
        style={{ maxHeight: '100%', height: '100%' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="transition-all duration-300 ease-out h-full w-full object-cover image-enhanced"
          style={transformStyle}
          draggable={false}
        />
        
        {/* Zoom control button */}
        {showResetButton && (
          <button
            onClick={resetZoom}
            className="absolute top-5 right-3 bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg backdrop-blur-sm border border-white/20"
          >
            {/* 翻译成英文 */}
            Reset Zoom
          </button>
        )}
        
        {/* Zoom hint */}
        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-sm border border-white/20 shadow-lg">
          {zoomHintText}
        </div>
        
        {/* AI Generated watermark - moved to top right to avoid overlap with zoom hint */}
        <div className="absolute bottom-6 right-3 text-white/70 text-xs font-medium pointer-events-none bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm" style={{ fontSize: '12px' }}>
          AI Generated
        </div>
        
        {/* Image overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
      </div>
    </Card>
  )
});
