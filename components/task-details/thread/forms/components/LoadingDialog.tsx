import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface LoadingDialogProps {
  isOpen: boolean
  content?: string
}

export function LoadingDialog({ isOpen, content = "Processing request..." }: LoadingDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogTitle className="sr-only">Loading</DialogTitle>
      <DialogContent className="max-w-[300px] flex items-center justify-start p-2" hideCloseButton>
        <div className="relative min-w-[50px] w-[50px] h-[50px]">
          <Loader2 className="w-[50px] h-[50px] animate-spin text-lime-500 absolute" />
          <Image
            src="/yw-logo_only.png"
            alt="YW Logo"
            width={30}
            height={30}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <p className="text-sm text-left text-gray-600 font-bold">
          {content}
        </p>
      </DialogContent>
    </Dialog>
  )
}
