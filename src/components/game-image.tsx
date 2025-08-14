import { Card } from "@/components/ui/card"

interface GameImageProps {
  imageUrl: string
}

export function GameImage({ imageUrl }: GameImageProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
      <div className="relative h-[500px] w-full">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Historical event image"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
