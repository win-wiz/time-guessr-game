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
    <Card className="h-[calc(100vh - 300px)] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
      <div 
        ref={containerRef}
        className="relative h-full w-full cursor-grab active:cursor-grabbing flex items-center justify-center"
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
          className="w-full h-full object-cover transition-transform duration-200 ease-out"
          style={transformStyle}
          draggable={false}
        />
        
        {/* Zoom control button */}
        {showResetButton && (
          <button
            onClick={resetZoom}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
          >
            Reset Zoom
          </button>
        )}
        
        {/* Zoom hint */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {zoomHintText}
        </div>
      </div>
    </Card>
  )
});
