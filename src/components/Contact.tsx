import { useState, type FormEvent } from 'react';
import { Phone, Mail, Send, CheckCircle2, AlertCircle, Loader2, HandHeart, Facebook, Instagram, Youtube, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { CONTACT } from '@/data/content';
import { useLang, getTranslation } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.73 2.89 2.89 0 0 1 2.31-4.62c.3 0 .59.05.87.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1Z" />
    </svg>
  );
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function Contact() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const settings = useSiteSettings();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const CONTACT_SOCIALS = [
    { name: 'TikTok', href: settings.social.tiktok, Icon: TikTokIcon },
    { name: 'Instagram', href: settings.social.instagram, Icon: Instagram },
    { name: 'Facebook', href: settings.social.facebook, Icon: Facebook },
    { name: 'YouTube', href: settings.social.youtube, Icon: Youtube },
    { name: 'LinkedIn', href: settings.social.linkedin, Icon: Linkedin },
    { name: 'X', href: settings.social.twitter, Icon: Twitter },
    { name: 'WhatsApp', href: settings.social.whatsapp, Icon: MessageCircle },
  ].filter((s) => s.href);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const organization = String(data.get('organization') ?? '').trim();
    const interest = String(data.get('interest') ?? 'other');
    const message = String(data.get('message') ?? '').trim();

    if (!name || !email || !message) {
      setStatus('error');
      setErrorMsg(t.contact.errFields);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/forms?action=contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: organization ? `${organization} — ${interest}` : interest,
          message,
        }),
      });

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(t.contact.errGeneric);
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
      setErrorMsg(t.contact.errGeneric);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

  return (
    <Section id="contacto" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -left-32 -top-20 h-72 w-72 rounded-full bg-dream-gradient-soft blur-3xl" />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="eyebrow text-primary-700">
            <HandHeart className="h-4 w-4" /> {t.contact.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
            {t.contact.title1} <span className="text-gradient-dream">{t.contact.title2}</span> {t.contact.titleSuffix}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
            {t.contact.lead}
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={`tel:${CONTACT.phone}`}
              className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow-blue transition-transform group-hover:scale-110">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{t.contact.phone}</p>
                <p className="font-display text-lg font-bold text-ink-900">{CONTACT.phone}</p>
              </div>
            </a>

            <a
              href={`mailto:${CONTACT.email}`}
              className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-dream-gradient text-white shadow-glow-dream transition-transform group-hover:scale-110">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{t.contact.email}</p>
                <p className="font-display text-lg font-bold text-ink-900 break-all">{CONTACT.email}</p>
              </div>
            </a>

            <a
              href={`mailto:${CONTACT.email2}`}
              className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow-blue transition-transform group-hover:scale-110">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{t.contact.email}</p>
                <p className="font-display text-lg font-bold text-ink-900 break-all">{CONTACT.email2}</p>
              </div>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {CONTACT_SOCIALS.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:text-primary-700 hover:shadow-card"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={2}>
          <form onSubmit={onSubmit} className="card-surface space-y-5 p-6 sm:p-8" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink-800">
                  {t.contact.name}
                </label>
                <input id="name" name="name" type="text" required autoComplete="name" className={inputClass} placeholder={t.contact.namePh} />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink-800">
                  {t.contact.email}
                </label>
                <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="tu@email.com" />
              </div>
            </div>

            <div>
              <label htmlFor="organization" className="mb-1.5 block text-sm font-semibold text-ink-800">
                {t.contact.org} <span className="font-normal text-ink-400">{t.contact.orgOptional}</span>
              </label>
              <input id="organization" name="organization" type="text" autoComplete="organization" className={inputClass} placeholder={t.contact.orgPh} />
            </div>

            <div>
              <label htmlFor="interest" className="mb-1.5 block text-sm font-semibold text-ink-800">
                {t.contact.interest}
              </label>
              <select id="interest" name="interest" defaultValue="ally" className={inputClass}>
                {t.contact.interests.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-ink-800">
                {t.contact.message}
              </label>
              <textarea id="message" name="message" required rows={4} className={`${inputClass} resize-none`} placeholder={t.contact.messagePh} />
            </div>

            <button type="submit" disabled={status === 'loading' || status === 'success'} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
              {status === 'loading' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t.contact.sending}</>
              ) : status === 'success' ? (
                <><CheckCircle2 className="h-4 w-4" /> {t.contact.sent}</>
              ) : (
                <><Send className="h-4 w-4" /> {t.contact.send}</>
              )}
            </button>

            {status === 'success' && (
              <p className="flex items-center gap-2 rounded-xl bg-success-50 px-4 py-3 text-sm font-medium text-success-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {t.contact.successMsg}
              </p>
            )}

            {status === 'error' && (
              <p className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
