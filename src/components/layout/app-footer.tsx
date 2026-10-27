import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { SocialFacebookIcon, SocialInstagramIcon, SocialLinkedinIcon, SocialTwitterIcon, SocialYoutubeIcon } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Icon } from './icon'
import { notifyOutOfScope } from './out-of-scope'
import { PageContainer } from './page-container'

const FEATURES = [
  {
    letter: 'W',
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    letter: 'C',
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    letter: 'D',
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

const COLLECTION_LINKS = [
  { label: 'Arte digital', slug: 'arte-digital' },
  { label: 'Fotografia', slug: 'fotografia' },
  { label: 'Música', slug: 'musica' },
  { label: 'Arte 3D', slug: 'arte-3d' },
  { label: 'Utilidade', slug: 'utilidade' },
]

const SOCIAL = [
  { icon: SocialFacebookIcon, label: 'Facebook' },
  { icon: SocialInstagramIcon, label: 'Instagram' },
  { icon: SocialTwitterIcon, label: 'Twitter' },
  { icon: SocialLinkedinIcon, label: 'LinkedIn' },
  { icon: SocialYoutubeIcon, label: 'YouTube' },
]

export function AppFooter() {
  const [email, setEmail] = useState('')
  return (
    <footer className="mt-16 hidden md:block">
      <PageContainer className="px-6">
        <div className="rounded-t-md bg-card px-10 pt-10 pb-8">
          <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr] gap-10">
            {FEATURES.map((feature, index) => (
              <div key={feature.letter} className={index > 0 ? 'border-l border-border pl-10' : ''}>
                <div
                  className="flex size-12.5 items-center justify-center rounded-full bg-primary font-mono text-lg font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  {feature.letter}
                </div>
                <h3 className="mt-6 font-mono text-base leading-5 font-bold text-foreground">{feature.title}</h3>
                <p className="mt-3 font-mono text-sm leading-6 text-sand">{feature.text}</p>
              </div>
            ))}
            <form
              className="border-l border-border pl-10"
              onSubmit={(event) => {
                event.preventDefault()
                toast.info('Newsletter não faz parte desta demonstração.', { id: 'newsletter' })
                setEmail('')
              }}
            >
              <h3 className="font-mono text-base leading-5 font-bold text-foreground">Antecipe-se ao próximo lançamento</h3>
              <div className="mt-4 flex">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="digite seu e-mail…"
                  aria-label="E-mail para a newsletter"
                  className="h-10 rounded-r-none border-r-0"
                />
                <Button type="submit" variant="primary" size="sm" radius="xs" className="rounded-l-none px-4">
                  Enviar
                </Button>
              </div>
              <p className="mt-3 font-mono text-sm leading-6 text-sand">
                Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
              </p>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1.4fr_1fr_1fr] items-center gap-10 bg-surface-dark px-10 py-6 font-mono text-sm text-foreground">
          <span className="text-sm font-bold tracking-[1.4px]">KURIO</span>
          <span className="leading-5">Feito para colecionadores, criadores e cultura</span>
          <a href="mailto:contato@email.com" className="hover:text-brand">
            contato@email.com
          </a>
          <a href="tel:+5511400289 22" className="hover:text-brand">
            +55 11 4002 8922
          </a>
        </div>

        <div className="grid grid-cols-4 gap-10 bg-card px-10 pt-8 pb-10 font-mono text-sm">
          <FooterColumn title="Meu perfil">
            <FooterLink to="/account/profile">Meu perfil</FooterLink>
            <FooterAction label="Minha coleção" />
            <FooterAction label="Atividade" />
            <FooterAction label="Estúdio do criador" />
            <FooterAction label="Lista de interesse" />
          </FooterColumn>
          <FooterColumn title="Central de ajuda">
            <FooterAction label="Central de ajuda" />
            <FooterAction label="Como comprar NFTs" />
            <FooterAction label="Carteira e segurança" />
            <FooterAction label="Política do mercado" />
            <FooterAction label="Denunciar item" />
          </FooterColumn>
          <FooterColumn title="Coleções">
            {COLLECTION_LINKS.map((c) => (
              <Link key={c.slug} to="/" search={{ collection: c.slug, page: 1 }} className="hover:text-brand">
                {c.label}
              </Link>
            ))}
          </FooterColumn>
          <FooterColumn title="Redes sociais">
            <ul className="flex gap-2" aria-label="Redes sociais">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => notifyOutOfScope(s.label)}
                    aria-label={s.label}
                    className="flex size-8 items-center justify-center rounded-sm text-primary outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon icon={s.icon} size={32} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-base font-bold text-foreground">Carteiras compatíveis</p>
            <span className="mt-2 inline-flex h-6.5 items-center rounded-md border border-border-soft bg-surface-dark px-2 text-[9px] font-bold tracking-[0.1px] text-brand">
              METAMASK&nbsp;&nbsp;•&nbsp;&nbsp;WALLETCONNECT&nbsp;&nbsp;•&nbsp;&nbsp;COINBASE
            </span>
          </FooterColumn>
        </div>
      </PageContainer>
      <p className="py-6 text-center font-mono text-sm text-foreground">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 text-foreground">
      <h3 className="mb-1 text-lg font-bold">{title}</h3>
      {children}
    </div>
  )
}

function FooterLink({ to, children }: { to: '/account/profile'; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-left hover:text-brand">
      {children}
    </Link>
  )
}

function FooterAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => notifyOutOfScope(label)}
      aria-disabled="true"
      className="text-left hover:text-brand"
      title="Fora do escopo desta demonstração"
    >
      {label}
    </button>
  )
}
