import { Card } from "@/components/ui/card"

interface GameImageProps {
  imageUrl: string
}

export function GameImage({ imageUrl }: GameImageProps) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="relative h-full w-full flex items-center justify-center">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Historical event image"
          className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  )
}
