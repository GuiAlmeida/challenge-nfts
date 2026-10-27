import { LinkedinIcon, MailIcon, TwitterIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'

export function ShareLinks({ title, url }: { title: string; url: string }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(`${title} na Kurio`)
  const links = [
    {
      label: 'Compartilhar no LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedinIcon,
    },
    {
      label: 'Compartilhar por e-mail',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: MailIcon,
    },
    {
      label: 'Compartilhar no X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: TwitterIcon,
    },
  ]
  return (
    <div className="flex items-center gap-2">
      <span className="text-[15px] leading-4 font-bold text-foreground">Compartilhar este NFT:</span>
      <ul className="flex items-center gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex size-6 items-center justify-center rounded-xs text-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon icon={link.icon} size={16} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
