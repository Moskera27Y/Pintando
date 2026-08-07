import { Phone, Mail, ArrowUp, Facebook, Instagram, Youtube, Linkedin, Twitter, MessageCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT } from '@/data/content';
import { useLang, getTranslation } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.73 2.89 2.89 0 0 1 2.31-4.62c.3 0 .59.05.87.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1Z" />
    </svg>
  );
}

export function Footer({ className = '' }: { className?: string }) {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const settings = useSiteSettings();

  const SOCIALS = [
    { name: 'Facebook', href: settings.social.facebook, Icon: Facebook },
    { name: 'Instagram', href: settings.social.instagram, Icon: Instagram },
    { name: 'TikTok', href: settings.social.tiktok, Icon: TikTokIcon },
    { name: 'YouTube', href: settings.social.youtube, Icon: Youtube },
    { name: 'LinkedIn', href: settings.social.linkedin, Icon: Linkedin },
    { name: 'X', href: settings.social.twitter, Icon: Twitter },
    { name: 'WhatsApp', href: settings.social.whatsapp, Icon: MessageCircle },
  ].filter((s) => s.href);

  return (
    <footer className={`relative overflow-hidden bg-ink-950 text-white ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-dream-gradient" />
      <div className="pointer-events-none absolute -right-20 -top-10 h-60 w-60 rounded-full bg-dream-purple/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 xl:px-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="inline-flex items-center rounded-2xl bg-white p-2 shadow-lg">
              <img src={settings.logo} alt={`${settings.siteName} logo`} className="h-16 w-auto object-contain" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {settings.siteDescription}
            </p>
            <p className="mt-4 text-sm font-medium text-white/40">
              {settings.footerText}
            </p>

            <div className="mt-6 flex gap-3">
              {SOCIALS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/50">{t.footer.navTitle}</h3>
            <ul className="mt-4 space-y-2.5">
              {t.nav.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white/50">{t.footer.contactTitle}</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={`tel:${CONTACT.phone}`} className="group flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white">
                  <Phone className="h-4 w-4 text-dream-orange" />
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="group flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white break-all">
                  <Mail className="h-4 w-4 shrink-0 text-dream-blue" />
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email2}`} className="group flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white break-all">
                  <Mail className="h-4 w-4 shrink-0 text-dream-blue" />
                  {CONTACT.email2}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <a href="#impacto" className="btn-dream !px-5 !py-2.5 !text-xs">{t.footer.beAlly}</a>
              <a href="#contacto" className="btn-ghost !px-5 !py-2.5 !text-xs border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/30">{t.footer.applyFamily}</a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} {t.footer.copyright}
            </p>
            <Link
              to="/admin/login"
              className="group inline-flex items-center gap-1.5 text-[11px] font-medium text-white/25 transition-colors hover:text-white/60"
              aria-label="Acceso administrador"
            >
              <Settings className="h-3 w-3 transition-transform group-hover:rotate-45" />
              Administración
            </Link>
          </div>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 text-xs font-medium text-white/50 transition-colors hover:text-white"
          >
            {t.footer.backTop}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 transition-all group-hover:-translate-y-0.5 group-hover:border-white/40">
              <ArrowUp className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
