import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Filters, type FiltersProps } from './filters'

export function FiltersSheet({ open, onOpenChange, ...filters }: FiltersProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[88svh] overflow-y-auto rounded-t-3xl border-border bg-card p-0">
        <SheetHeader className="px-5 pt-5 pb-0">
          <SheetTitle className="text-lg font-bold">Filtros</SheetTitle>
          <SheetDescription className="text-[13px] text-sand">Os resultados atualizam ao marcar uma opção.</SheetDescription>
        </SheetHeader>
        <Filters {...filters} className="pt-2" />
      </SheetContent>
    </Sheet>
  )
}
