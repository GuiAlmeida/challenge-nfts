import { useId, useRef } from 'react'
import { ImageIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { Button } from '@/components/ui/button'
import type { PublicUser } from '@/contracts/auth'
import type { AvatarFlow } from '../use-avatar-flow'

export function AvatarField({ user, flow }: { user: PublicUser; flow: AvatarFlow }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const labelId = useId()
  const errorId = useId()
  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={flow.error ? errorId : undefined} className="flex flex-col gap-2">
      <span id={labelId} className="font-mono text-[15px] leading-3.75 text-foreground">
        Avatar
      </span>
      <div className="flex items-center gap-6">
        <span className="flex size-12.5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised text-brand">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Seu avatar" width={50} height={50} className="size-full object-cover" />
          ) : (
            <Icon icon={ImageIcon} size={22} />
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label="Escolher imagem do avatar"
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            void flow.choose(file)
          }}
        />
        <Button type="button" size="sm" radius="xs" className="min-w-24.5 px-6 text-sm" onClick={() => inputRef.current?.click()} disabled={flow.pending}>
          Alterar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-0 text-sm text-foreground hover:text-brand"
          onClick={flow.remove}
          disabled={!user.avatarUrl || flow.pending}
        >
          Remover
        </Button>
      </div>
      {flow.error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {flow.error}
        </p>
      ) : null}
    </div>
  )
}
