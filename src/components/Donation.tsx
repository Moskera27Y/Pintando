import { useState, type FormEvent } from 'react';
import { Heart, Building2, ShieldCheck, Loader2, CheckCircle2, AlertCircle, User, Mail, CreditCard, ExternalLink, Gift, Zap } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useLang, getTranslation } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

type DonorType = 'individual' | 'corporate';
type Status = 'idle' | 'loading' | 'success' | 'error';

const PRESET_AMOUNTS = [25, 50, 100] as const;

function buildPayPalLink(base: string, amount: number): string {
  if (!base) return '';
  const trimmed = base.trim();
  if (trimmed.endsWith('/')) return `${trimmed}${amount.toFixed(2)}`;
  return `${trimmed}/${amount.toFixed(2)}`;
}

export function Donation() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const settings = useSiteSettings();
  const presetAmounts = settings.donationAmounts.length > 0 ? settings.donationAmounts : [25, 50, 100];
  const [tab, setTab] = useState<DonorType>('individual');
  const [amount, setAmount] = useState<number | ''>(50);
  const [custom, setCustom] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [redirectType, setRedirectType] = useState<'stripe' | 'paypal'>('stripe');

  const finalAmount = custom ? Number(custom) : amount;
  const paypalLink = settings.donation?.paypalLink || 'https://paypal.me/Pintando712';
  const stripeDonationLink = settings.stripe?.donationLink || 'https://donate.stripe.com/test_3cI9AVgzK6fu3SU5KF1Jm00';
  const preferredMethod = settings.stripe?.preferredDonationMethod || 'both';
  const currency = settings.donation?.currency || settings.currency || 'USD';
  const buttonText = settings.donation?.buttonText || t.donation.submit;

  const recordDonation = async (value: number) => {
    try {
      const res = await fetch(`${API_BASE}/forms?action=donaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: value,
          currency,
          donorName: anonymous ? null : name.trim() || null,
          donorEmail: anonymous ? null : email.trim() || null,
          message: tab === 'corporate' ? organization.trim() || null : null,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const value = custom ? Number(custom) : amount;
    if (!value || value <= 0) {
      setStatus('error');
      setErrorMsg(t.donation.errAmount);
      return;
    }
    if (!anonymous && (!name.trim() || !email.trim())) {
      setStatus('error');
      setErrorMsg(t.donation.errName);
      return;
    }

    const ok = await recordDonation(value);
    if (!ok) {
      setStatus('error');
      setErrorMsg(t.donation.errGeneric);
      return;
    }

    if (preferredMethod === 'stripe') {
      setRedirecting(true);
      setRedirectType('stripe');
      window.open(stripeDonationLink, '_blank', 'noopener,noreferrer');
    } else if (preferredMethod === 'paypal') {
      setRedirecting(true);
      setRedirectType('paypal');
      window.open(buildPayPalLink(paypalLink, value), '_blank', 'noopener,noreferrer');
    } else {
      setRedirecting(true);
      setRedirectType('stripe');
      window.open(stripeDonationLink, '_blank', 'noopener,noreferrer');
    }
    setStatus('success');
  };

  const donateWithPayPal = () => {
    const value = custom ? Number(custom) : amount;
    if (!value || value <= 0) return;
    setRedirectType('paypal');
    window.open(buildPayPalLink(paypalLink, value), '_blank', 'noopener,noreferrer');
  };

  const reset = () => {
    setStatus('idle');
    setAmount(50);
    setCustom('');
    setAnonymous(false);
    setName('');
    setEmail('');
    setOrganization('');
    setRedirecting(false);
  };

  return (
    <Section id="donacion" className="relative overflow-hidden bg-ink-50">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-dream-red/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-primary-600/10 blur-3xl" />

      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="eyebrow text-dream-red justify-center">
          <Heart className="h-4 w-4" /> {t.donation.eyebrow}
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
          {t.donation.title1} <span className="text-gradient-dream">{t.donation.title2}</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
          {t.donation.lead}
        </p>
      </Reveal>

      <Reveal delay={1} className="mx-auto mt-12 max-w-2xl">
        <div className="card-surface overflow-hidden p-0">
          <div className="grid grid-cols-2 gap-1 border-b border-ink-100 bg-ink-50 p-1.5">
            <button
              type="button"
              onClick={() => { setTab('individual'); reset(); }}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                tab === 'individual' ? 'bg-white text-primary-700 shadow-soft' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <Heart className="h-4 w-4" /> {t.donation.tabIndividual}
            </button>
            <button
              type="button"
              onClick={() => { setTab('corporate'); reset(); }}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                tab === 'corporate' ? 'bg-white text-primary-700 shadow-soft' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <Building2 className="h-4 w-4" /> {t.donation.tabCorporate}
            </button>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center px-8 py-14 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-extrabold text-ink-900">{t.donation.successTitle}</h3>
              <p className="mt-2 max-w-md text-sm text-ink-600">
                {t.donation.successMsg} <strong className="text-ink-900">${finalAmount.toLocaleString()} {currency}</strong>
                {tab === 'corporate' ? ` ${t.donation.corpSuffix}` : ''}
                {anonymous ? ` ${t.donation.anonSuffix}` : ''} {t.donation.successSuffix}
              </p>
              {redirecting && redirectType === 'paypal' && (
                <a
                  href={buildPayPalLink(paypalLink, finalAmount || 50)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5"
                >
                  <ExternalLink className="h-4 w-4" /> {t.donation.openPaypal}
                </a>
              )}
              {redirecting && redirectType === 'stripe' && (
                <a
                  href={stripeDonationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5"
                >
                  <ExternalLink className="h-4 w-4" /> {t.donation.openStripe}
                </a>
              )}
              {preferredMethod === 'both' && redirecting && redirectType === 'stripe' && (
                <button type="button" onClick={donateWithPayPal} className="btn-ghost mt-3">
                  <ExternalLink className="h-4 w-4" /> {t.donation.donatePaypalAlt}
                </button>
              )}
              <button type="button" onClick={reset} className="btn-ghost mt-6">
                {t.donation.again}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6 p-6 sm:p-8" noValidate>
              <div>
                <label className="mb-3 block text-sm font-semibold text-ink-800">{t.donation.selectAmount}</label>
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setAmount(preset); setCustom(''); }}
                      className={`rounded-2xl border-2 py-4 font-display text-lg font-extrabold transition-all ${
                        amount === preset && !custom
                          ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-soft'
                          : 'border-ink-200 bg-white text-ink-700 hover:border-primary-300'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label htmlFor="custom-amount" className="sr-only">{t.donation.otherAmount}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg font-bold text-ink-400">$</span>
                    <input
                      id="custom-amount"
                      type="number"
                      min={1}
                      step={1}
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setAmount(''); }}
                      placeholder={t.donation.otherAmount}
                      className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-9 pr-4 text-sm font-semibold text-ink-900 outline-none transition-all placeholder:font-normal placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 transition-colors hover:bg-ink-50">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium leading-relaxed text-ink-700">
                  {t.donation.anonymous}
                </span>
              </label>

              {!anonymous && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={tab === 'corporate' ? 'sm:col-span-2' : ''}>
                    <label htmlFor="donor-name" className="mb-1.5 block text-sm font-semibold text-ink-800">{t.donation.name}</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                      <input
                        id="donor-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder={t.donation.namePh}
                      />
                    </div>
                  </div>
                  <div className={tab === 'corporate' ? 'sm:col-span-2' : ''}>
                    <label htmlFor="donor-email" className="mb-1.5 block text-sm font-semibold text-ink-800">{t.donation.email}</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                      <input
                        id="donor-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  {tab === 'corporate' && (
                    <div className="sm:col-span-2">
                      <label htmlFor="donor-org" className="mb-1.5 block text-sm font-semibold text-ink-800">{t.donation.org}</label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                        <input
                          id="donor-org"
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          placeholder={t.donation.orgPh}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {preferredMethod === 'both' ? (
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === 'loading' ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {t.donation.processing}</>
                    ) : (
                      <><Zap className="h-4 w-4" /> {t.donation.donateStripe}</>
                    )}
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-ink-200" />
                    <span className="text-xs font-semibold uppercase text-ink-400">{t.donation.or}</span>
                    <div className="h-px flex-1 bg-ink-200" />
                  </div>
                  <button
                    type="button"
                    onClick={donateWithPayPal}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#003087] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#002266]"
                  >
                    <CreditCard className="h-4 w-4" /> {t.donation.donatePaypal}
                  </button>
                </div>
              ) : preferredMethod === 'paypal' ? (
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#003087] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#002266] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t.donation.processing}</>
                  ) : (
                    <><CreditCard className="h-4 w-4" /> {buttonText}</>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t.donation.processing}</>
                  ) : (
                    <><Zap className="h-4 w-4" /> {t.donation.donateStripe}</>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-2 pt-1">
                {preferredMethod !== 'paypal' && (
                  <>
                    <span className="rounded-md bg-[#635BFF] px-3 py-1.5 text-xs font-bold text-white">Stripe</span>
                    <span className="text-xs font-semibold text-ink-400">·</span>
                  </>
                )}
                {preferredMethod !== 'stripe' && (
                  <>
                    <span className="rounded-md bg-[#003087] px-3 py-1.5 text-xs font-bold text-white">PayPal</span>
                    <span className="text-xs font-semibold text-ink-400">·</span>
                  </>
                )}
                <span className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-bold text-ink-700">Visa</span>
                <span className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-bold text-ink-700">Mastercard</span>
                <span className="rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-bold text-ink-700">Amex</span>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
                <ShieldCheck className="h-3.5 w-3.5 text-success-500" />
                {t.donation.secure}
              </p>

              {status === 'error' && (
                <p className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
                </p>
              )}
            </form>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
