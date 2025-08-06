import { Card } from "@/components/ui/card"

interface GameImageProps {
  imageUrl: string
}

export function GameImage({ imageUrl }: GameImageProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-[500px] w-full">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Toronto street view with blurred signs"
          className="h-full w-full object-cover"
        />
      </div>
    </Card>
  )
}
