import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { ImageDialogState } from "./types"
import { shouldUseNextImage } from "./utils"

interface ImageDialogProps {
  imageDialog: ImageDialogState
  onClose: () => void
  onOpenChange: (open: boolean) => void
}

export function ImageDialog({ imageDialog, onClose, onOpenChange }: ImageDialogProps) {
  return (
    <Dialog 
      open={imageDialog.open} 
      onOpenChange={onOpenChange}
      modal
    >
      <DialogTitle className="sr-only">Image Viewer</DialogTitle>
      <DialogContent 
        className="max-w-screen-lg w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-transparent border-none shadow-none"
        hideCloseButton
        aria-describedby={imageDialog.alt || "Full size image"}
      >
        <div className="flex justify-end p-2 absolute top-2 right-2 z-10">
          <button 
            onClick={onClose}
            className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center bg-transparent overflow-auto p-4">
          {shouldUseNextImage(imageDialog.src) ? (
            <Image 
              src={imageDialog.src} 
              alt={imageDialog.alt} 
              width={800}
              height={600}
              className="max-h-full max-w-full object-contain shadow-xl"
              style={{ width: 'auto', height: 'auto' }}
              unoptimized
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageDialog.src} 
                alt={imageDialog.alt} 
                className="max-h-full max-w-full object-contain shadow-xl"
                style={{ width: 'auto', height: 'auto' }}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
