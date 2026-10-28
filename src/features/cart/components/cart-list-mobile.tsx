import { Link } from '@tanstack/react-router'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { TrashIcon } from '@/assets/icons'
import { Icon, NftImage, Price } from '@/components/layout'
import type { CartItem } from '@/contracts/cart'
import { maxQuantity } from '../cart.rules'

const round =
  'flex size-6 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 [&_svg]:size-3.5'

export function CartListMobile({
  items,
  onQuantity,
  onRemove,
  disabled,
}: {
  items: CartItem[]
  onQuantity: (item: CartItem, quantity: number) => void
  onRemove: (item: CartItem) => void
  disabled?: boolean
}) {
  return (
    <ul className="flex flex-col gap-5">
      {items.map((item) => {
        const max = Math.max(maxQuantity(item), item.quantity)
        return (
          <li
            key={item.id}
            data-testid="cart-row"
            className="relative flex h-25 overflow-hidden rounded-[14px] bg-card shadow-[0_6px_20px_rgba(10,6,4,0.45)]"
          >
            <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <NftImage image={item.image} width={100} height={100} sizes="100px" className="size-25" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between py-3 pl-2">
              <p className="truncate text-[15px] leading-4 font-bold text-foreground">{item.name}</p>
              <p className="text-sm leading-4 text-sand">
                Edição: {item.editionLabel}
                {item.available < item.quantity ? (
                  <span role="alert" className="ml-2 text-xs text-coral">
                    {item.available === 0 ? 'Esgotado' : `Só ${item.available} disponíveis`}
                  </span>
                ) : null}
              </p>
              <Price value={item.lineTotal} size="md" />
            </div>
            <div className="flex flex-col items-end justify-between py-3 pr-2.5">
              <button
                type="button"
                onClick={() => onRemove(item)}
                disabled={disabled}
                aria-label={`Remover ${item.name} do carrinho`}
                className="rounded-sm text-foreground outline-none hover:text-coral focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon icon={TrashIcon} size={20} />
              </button>
              <div role="group" aria-label={`Quantidade de ${item.name}`} className="flex items-center gap-2">
                <button
                  type="button"
                  className={round}
                  onClick={() => onQuantity(item, item.quantity - 1)}
                  disabled={disabled || item.quantity <= 1}
                  aria-label={`Diminuir quantidade de ${item.name}`}
                >
                  <MinusIcon aria-hidden="true" />
                </button>
                <output aria-live="polite" className="min-w-[1ch] text-center text-base leading-5.5 text-foreground">
                  {item.quantity}
                </output>
                <button
                  type="button"
                  className={round}
                  onClick={() => onQuantity(item, item.quantity + 1)}
                  disabled={disabled || item.quantity >= max}
                  aria-label={`Aumentar quantidade de ${item.name}`}
                >
                  <PlusIcon aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
