import { Facebook, Instagram, Youtube, Linkedin, Twitter, Heart, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.73 2.89 2.89 0 0 1 2.31-4.62c.3 0 .59.05.87.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1Z" />
    </svg>
  );
}

export function SocialRail() {
  const settings = useSiteSettings();

  const RAIL = [
    {
      name: 'TikTok',
      href: settings.social.tiktok,
      Icon: TikTokIcon,
      bg: 'bg-[#010101]',
      shadow: 'shadow-[0_4px_14px_rgba(0,0,0,0.5)]',
      ring: 'ring-[#010101]/30',
    },
    {
      name: 'Facebook',
      href: settings.social.facebook,
      Icon: Facebook,
      bg: 'bg-[#1877F2]',
      shadow: 'shadow-[0_4px_14px_rgba(24,119,242,0.55)]',
      ring: 'ring-[#1877F2]/30',
    },
    {
      name: 'Instagram',
      href: settings.social.instagram,
      Icon: Instagram,
      bg: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      shadow: 'shadow-[0_4px_14px_rgba(221,42,123,0.5)]',
      ring: 'ring-[#DD2A7B]/30',
    },
    {
      name: 'YouTube',
      href: settings.social.youtube,
      Icon: Youtube,
      bg: 'bg-[#FF0000]',
      shadow: 'shadow-[0_4px_14px_rgba(255,0,0,0.5)]',
      ring: 'ring-[#FF0000]/30',
    },
    {
      name: 'LinkedIn',
      href: settings.social.linkedin,
      Icon: Linkedin,
      bg: 'bg-[#0A66C2]',
      shadow: 'shadow-[0_4px_14px_rgba(10,102,194,0.5)]',
      ring: 'ring-[#0A66C2]/30',
    },
    {
      name: 'X',
      href: settings.social.twitter,
      Icon: Twitter,
      bg: 'bg-[#000000]',
      shadow: 'shadow-[0_4px_14px_rgba(0,0,0,0.5)]',
      ring: 'ring-[#000000]/30',
    },
    {
      name: 'WhatsApp',
      href: settings.social.whatsapp,
      Icon: MessageCircle,
      bg: 'bg-[#25D366]',
      shadow: 'shadow-[0_4px_14px_rgba(37,211,102,0.55)]',
      ring: 'ring-[#25D366]/30',
    },
  ].filter((s) => s.href);

  return (
    <>
      {/* Desktop: tabs anchored to left edge, slide open on hover */}
      <div className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        {RAIL.map(({ name, href, Icon, bg, shadow, ring }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className={`
              group flex h-12 w-12 items-center overflow-hidden rounded-r-2xl
              ${bg} ${shadow}
              text-white ring-2 ${ring}
              transition-all duration-300 ease-out
              hover:w-36
            `}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center">
              <Icon className="h-5 w-5" />
            </span>
            <span className="whitespace-nowrap pr-4 text-sm font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {name}
            </span>
          </a>
        ))}

        {/* Donate button */}
        <a
          href="#donacion"
          aria-label="Donar"
          className="
            group mt-1 flex h-12 w-12 items-center overflow-hidden rounded-r-2xl
            bg-primary-600
            shadow-[0_4px_14px_rgba(37,99,235,0.55)]
            text-white ring-2 ring-primary-400/30
            transition-all duration-300 ease-out
            hover:w-36
          "
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center">
            <Heart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </span>
          <span className="whitespace-nowrap pr-4 text-sm font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Donar
          </span>
        </a>
      </div>

      {/* Mobile: floating bar at bottom with brand colors */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2.5 border-t border-ink-900/10 bg-ink-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        {RAIL.map(({ name, href, Icon, bg, shadow }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${bg} ${shadow} transition-transform duration-150 active:scale-90`}
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
        <a
          href="#donacion"
          aria-label="Donar"
          className="ml-2 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.5)] transition-transform duration-150 active:scale-95"
        >
          <Heart className="h-4 w-4" /> Donar
        </a>
      </div>
    </>
  );
}
