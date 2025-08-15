"use client";

import { Card } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"

interface GameImageProps {
  imageUrl: string
  eventName?: string
}

export function GameImage({ imageUrl, eventName }: GameImageProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // 添加全局滚轮事件监听器，处理整个页面的滚轮事件
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      // 检查是否在地图区域内滚动
      const target = e.target as Element
      const isInMap = target.closest('[data-map-container]')
      const isInImageContainer = containerRef.current?.contains(target as Node)
      
      // 只有当鼠标在图片容器内且不在地图区域内时才处理图片缩放
      if (isInImageContainer && !isInMap) {
        e.preventDefault()
        e.stopPropagation()
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newScale = Math.max(0.5, Math.min(3, scale * delta))
        
        // 缩小时的约束：当缩小到接近原始大小时，重置位置
        if (newScale <= 1) {
          setScale(1)
          setPosition({ x: 0, y: 0 })
        } else {
          setScale(newScale)
        }
      }
    }

    // 使用 passive: false 确保可以调用 preventDefault
    document.addEventListener('wheel', handleGlobalWheel, { passive: false })
    
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel)
    }
  }, [scale])

  const handleWheel = (e: React.WheelEvent) => {
    // 只有当鼠标在图片容器内时才处理缩放
    if (!containerRef.current?.contains(e.target as Node)) {
      return
    }
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(3, scale * delta))
    
    // 缩小时的约束：当缩小到接近原始大小时，重置位置
    if (newScale <= 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(newScale)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <Card className="h-full w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg relative z-10">
      <div 
        ref={containerRef}
        className="relative h-full w-full cursor-grab active:cursor-grabbing flex items-center justify-center z-10"
        style={{ maxHeight: '100%', height: '100%' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={eventName || "Historical event image"}
          className="w-full h-full object-cover transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center',
            objectFit: 'contain'
          }}
          draggable={false}
        />
        
        {/* 缩放控制按钮 */}
        {scale !== 1 && (
          <button
            onClick={resetZoom}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
          >
            重置缩放
          </button>
        )}
        
        {/* 缩放提示 */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
          滚轮缩放 • {scale > 1 ? '拖拽移动' : '缩放查看细节'}
        </div>
      </div>
    </Card>
  )
}
