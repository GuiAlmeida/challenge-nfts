import { Link } from '@tanstack/react-router'
import { ShopIcon } from '@/assets/icons'
import { Icon, Price, Stepper } from '@/components/layout'
import { Button } from '@/components/ui/button'
import type { NftDetailFlow } from './use-nft-detail-flow'

export function BuyBar({ flow, name }: { flow: NftDetailFlow; name: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-[40px] bg-card px-6 pt-5 pb-[max(env(safe-area-inset-bottom),36px)] shadow-[0_0_10px_rgba(10,6,4,0.45)] md:hidden">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[15px] leading-4 font-medium text-sand">Qtd.</span>
            <Stepper
              value={flow.quantity}
              min={flow.soldOut ? 0 : 1}
              max={flow.max}
              onChange={flow.setQuantity}
              size="sm"
              label={name}
              disabled={flow.soldOut}
            />
          </div>
          <Price value={flow.edition.price} size="lg" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="pill"
            size="lg"
            radius="pill"
            className="min-w-0 flex-1 px-0"
            onClick={flow.buy}
            disabled={flow.soldOut || flow.buying}
          >
            {flow.buying ? 'Adicionando…' : flow.soldOut ? 'Esgotado' : 'Adicionar ao carrinho'}
          </Button>
          <Button asChild variant="subtle" size="icon-lg" radius="pill" aria-label="Ir para o carrinho">
            <Link to="/cart">
              <Icon icon={ShopIcon} size={20} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
