import { NftImage } from '@/components/layout'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { NftImage as NftImageData } from '@/contracts/nft'

export function ImageZoomDialog({
  image,
  title,
  open,
  onOpenChange,
}: {
  image: NftImageData | null
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,900px)] rounded-2xl border-border bg-card p-3 sm:max-w-[min(92vw,900px)]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Arte ampliada. Pressione Esc para fechar.</DialogDescription>
        {image ? (
          <NftImage image={image} width={900} height={900} sizes="(min-width: 960px) 900px, 92vw" className="aspect-square w-full rounded-xl" />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
