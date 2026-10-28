import { Link } from '@tanstack/react-router'
import { TrashIcon } from '@/assets/icons'
import { Icon, NftImage, Price, Stepper } from '@/components/layout'
import type { CartItem } from '@/contracts/cart'
import { maxQuantity } from '../cart.rules'

const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_7.5rem_8.75rem_8.75rem_3rem] items-center'

export function CartTable({
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
    <div className="flex flex-col gap-3">
      <div className={`${COLUMNS} pr-6 text-base leading-4 font-medium text-foreground`} aria-hidden="true">
        <span>NFTs</span>
        <span>Preço</span>
        <span>Edições</span>
        <span>Total</span>
        <span />
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const max = maxQuantity(item)
          return (
            <li key={item.id} className={`${COLUMNS} h-17.5 rounded-md bg-card pr-6`} data-testid="cart-row">
              <div className="flex min-w-0 items-center gap-4">
                <Link
                  to="/nft/$nftId"
                  params={{ nftId: item.nftId }}
                  className="shrink-0 rounded-l-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <NftImage image={item.image} width={70} height={70} sizes="70px" className="size-17.5 rounded-l-md" />
                </Link>
                <div className="flex min-w-0 flex-col gap-2">
                  <Link
                    to="/nft/$nftId"
                    params={{ nftId: item.nftId }}
                    className="truncate text-[15px] leading-4 font-bold text-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.name}
                  </Link>
                  <span className="text-sm leading-4 text-muted-foreground">
                    ID do token: {item.tokenId} · Edição {item.editionLabel}
                  </span>
                </div>
              </div>
              <span className="flex flex-col">
                <span className="sr-only">Preço unitário</span>
                <Price value={item.unitPrice} size="sm" />
              </span>
              <div className="flex flex-col gap-1">
                <Stepper
                  value={item.quantity}
                  min={1}
                  max={Math.max(max, item.quantity)}
                  onChange={(next) => onQuantity(item, next)}
                  size="sm"
                  label={item.name}
                  disabled={disabled}
                />
                {item.available < item.quantity ? (
                  <span role="alert" className="text-xs leading-4 text-coral">
                    {item.available === 0 ? 'Esgotado' : `Só ${item.available} disponíveis`}
                  </span>
                ) : null}
              </div>
              <span className="flex flex-col">
                <span className="sr-only">Total do item</span>
                <Price value={item.lineTotal} size="sm" />
              </span>
              <button
                type="button"
                onClick={() => onRemove(item)}
                disabled={disabled}
                aria-label={`Remover ${item.name} do carrinho`}
                className="flex size-10 items-center justify-center justify-self-end rounded-sm text-foreground outline-none hover:text-coral focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <Icon icon={TrashIcon} size={22} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
