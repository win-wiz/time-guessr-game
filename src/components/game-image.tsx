"use client";

import { Card } from "@/components/ui/card"
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"

interface GameImageProps {
  imageUrl: string
  eventName?: string
}

export const GameImage = memo(function GameImage({ imageUrl, eventName }: GameImageProps) {
  const [scale, setScale] = useState(1)
  const [baseScale, setBaseScale] = useState(1) // 基础缩放比例
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // 计算智能缩放比例 - 使用 useCallback 优化
  const calculateSmartScale = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return 1

    const container = containerRef.current
    const image = imageRef.current
    
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const containerRatio = containerWidth / containerHeight
    
    // 等待图片加载完成获取真实尺寸
    if (image.naturalWidth === 0 || image.naturalHeight === 0) return 1
    
    const imageRatio = image.naturalWidth / image.naturalHeight
    
    // 如果容器比图片更宽（大屏场景），更积极地放大以减少留白
    if (containerRatio > imageRatio) {
      // 计算宽高比差异程度
      const ratioGap = containerRatio / imageRatio
      
      // 根据比例差异调整缩放策略
      if (ratioGap > 2) {
        // 极宽屏场景（如超宽显示器），更积极缩放
        const scaleToFillWidth = containerWidth / (containerHeight * imageRatio)
        return Math.min(scaleToFillWidth * 0.95, 2.5)
      } else if (ratioGap > 1.5) {
        // 宽屏场景，中等缩放
        const scaleToFillWidth = containerWidth / (containerHeight * imageRatio)
        return Math.min(scaleToFillWidth * 0.9, 2)
      } else {
        // 轻微宽屏，保守缩放
        const scaleToFillWidth = containerWidth / (containerHeight * imageRatio)
        return Math.min(scaleToFillWidth * 0.85, 1.3)
      }
    }
    
    // 如果容器比图片更高，稍微放大以优化显示
    if (containerRatio < imageRatio) {
      const scaleToFillHeight = containerHeight / (containerWidth / imageRatio)
      return Math.min(scaleToFillHeight * 0.9, 1.4)
    }
    
    return 1
  }, [])

  // 图片加载完成后计算智能缩放 - 使用 useCallback 优化
  const handleImageLoad = useCallback(() => {
    const smartScale = calculateSmartScale()
    setBaseScale(smartScale)
    setScale(smartScale)
  }, [calculateSmartScale])

  // 窗口大小变化时重新计算 - 使用 useCallback 优化
  const handleResize = useCallback(() => {
    const smartScale = calculateSmartScale()
    setBaseScale(smartScale)
    // 如果当前是基础缩放状态，更新缩放
    if (Math.abs(scale - baseScale) < 0.1) {
      setScale(smartScale)
    }
  }, [calculateSmartScale, scale, baseScale])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // 添加全局滚轮事件监听器 - 使用 useCallback 优化
  const handleGlobalWheel = useCallback((e: WheelEvent) => {
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
  }, [scale])

  useEffect(() => {
    // 使用 passive: false 确保可以调用 preventDefault
    document.addEventListener('wheel', handleGlobalWheel, { passive: false })
    
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel)
    }
  }, [handleGlobalWheel])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // 只有当鼠标在图片容器内时才处理缩放
    if (!containerRef.current?.contains(e.target as Node)) {
      return
    }
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(baseScale * 0.8, Math.min(3, scale * delta))
    
    // 缩小时的约束：当缩小到接近基础缩放时，重置位置
    if (newScale <= baseScale * 1.1) {
      setScale(baseScale)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(newScale)
    }
  }, [baseScale, scale])

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
    setScale(baseScale)
    setPosition({ x: 0, y: 0 })
  }, [baseScale])

  // 使用 useMemo 缓存样式计算
  const imageTransformStyle = useMemo(() => ({
    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
    transformOrigin: 'center center',
    objectFit: 'contain' as const
  }), [scale, position.x, position.y])

  const backgroundStyle = useMemo(() => ({
    backgroundImage: `url(${imageUrl || "/placeholder.svg"})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(20px) brightness(0.3)',
    transform: 'scale(1.1)', // 稍微放大避免边缘模糊效果
  }), [imageUrl])

  return (
    <Card className="h-full w-full overflow-hidden bg-transparent border-transparent relative z-10">
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
        {/* 背景模糊图片 - 透明留白 */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={backgroundStyle}
        />
        
        {/* 主图片 */}
        <img
          ref={imageRef}
          src={imageUrl || "/placeholder.svg"}
          alt={eventName || "Historical event image"}
          className="w-full h-full object-cover transition-transform duration-200 ease-out"
          style={imageTransformStyle}
          onLoad={handleImageLoad}
          draggable={false}
        />
        
        {/* 缩放控制按钮 */}
        {Math.abs(scale - baseScale) > 0.1 && (
          <button
            onClick={resetZoom}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
          >
            {/* 翻译成英文 */}
            重置缩放
          </button>
        )}
        
        {/* 缩放提示 */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
          滚轮缩放 • {scale > baseScale ? '拖拽移动' : '缩放查看细节'}
        </div>
      </div>
    </Card>
  )
})
