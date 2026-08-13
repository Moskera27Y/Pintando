import { useEffect, useState, useCallback } from 'react';
import { Save, Globe, CreditCard, BarChart3, Share2, Search, Heart, Repeat, CheckCircle2, AlertCircle, Loader2, DollarSign, Link2, Mail, Zap } from 'lucide-react';
import { Card, PageHeader, Button, Input, Textarea, Select } from '@/admin/components/ui';
import { getSettings, updateSettings, type SiteSettings } from '@/admin/services/db';

const DEFAULT: SiteSettings = {
  siteName: 'Pintando Sueños',
  siteDescription: 'Transformando comunidades a través del arte',
  logo: '/imagen_2026-07-30_174722687.png',
  favicon: '/favicon/favicon.ico',
  footerText: 'Pintando Sueños — Transformando comunidades a través del arte',
  social: {
    facebook: 'https://www.facebook.com/share/1Bh1t7pxvQ/?mibextid=wwXIfr',
    instagram: 'https://www.instagram.com/pintandosuenos97',
    tiktok: 'https://www.tiktok.com/@pintandosuenos1',
    twitter: '',
    youtube: '',
    linkedin: '',
    whatsapp: '',
  },
  seo: {
    metaTitle: 'Pintando Sueños — Arte comunitario',
    metaDescription: 'Transformando comunidades a través del arte',
    keywords: 'pintando sueños, arte comunitario, remodelación, voluntariado',
    ogImage: '',
  },
  donation: {
    enabled: true,
    paypalLink: 'https://paypal.me/Pintando712',
    receiverEmail: 'paintingdreams@pintandosueños.com',
    buttonText: 'Donar ahora',
    currency: 'USD',
  },
  stripe: {
    publishableKey: '',
    donationLink: 'https://donate.stripe.com/test_3cI9AVgzK6fu3SU5KF1Jm00',
    preferredDonationMethod: 'both',
  },
  analytics: {
    googleAnalyticsId: '',
    metaPixelId: '',
  },
  currency: 'USD',
  donationAmounts: [25, 50, 100],
  subscriptionSettings: {
    minAmount: 10,
    defaultInterval: 'monthly',
    allowCustom: true,
  },
};

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

function shallowEqual(a: SiteSettings, b: SiteSettings): boolean {
  const ka = Object.keys(a) as (keyof SiteSettings)[];
  for (const k of ka) {
    const av = a[k];
    const bv = b[k];
    if (typeof av === 'string' && typeof bv === 'string') {
      if (av !== bv) return false;
    } else if (Array.isArray(av) && Array.isArray(bv)) {
      if (av.length !== bv.length || av.some((v, i) => v !== bv[i])) return false;
    } else if (typeof av === 'object' && typeof bv === 'object' && av !== null && bv !== null) {
      const ao = av as Record<string, unknown>;
      const bo = bv as Record<string, unknown>;
      for (const key of Object.keys(ao)) {
        if (ao[key] !== bo[key]) return false;
      }
    } else if (av !== bv) {
      return false;
    }
  }
  return true;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [original, setOriginal] = useState<SiteSettings>(DEFAULT);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;
    getSettings()
      .then((s) => {
        if (!active) return;
        setSettings(s);
        setOriginal(s);
        setStatus('idle');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
        setErrorMsg('No se pudo cargar la configuración');
      });
    return () => {
      active = false;
    };
  }, []);

  const hasChanges = !shallowEqual(settings, original);

  const update = useCallback((path: string, value: string | number | boolean | number[]) => {
    setSettings((prev) => {
      const next = structuredClone(prev) as SiteSettings;
      const parts = path.split('.');
      if (parts.length === 1) {
        (next as Record<string, unknown>)[parts[0]] = value;
      } else {
        const obj = (next as unknown as Record<string, Record<string, unknown>>)[parts[0]];
        obj[parts[1]] = value;
      }
      return next;
    });
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setOriginal(updated);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'No fue posible guardar los cambios');
    }
  };

  const statusLabel =
    status === 'saving' ? 'Guardando...' :
    status === 'saved' ? 'Guardado correctamente' :
    status === 'error' ? 'Error al guardar' :
    hasChanges ? 'Cambios pendientes' : 'Sin cambios';

  const statusColor =
    status === 'saved' ? 'text-success-400' :
    status === 'error' ? 'text-error-400' :
    hasChanges ? 'text-warning-400' : 'text-ink-500';

  const statusIcon =
    status === 'saving' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
    status === 'saved' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
    status === 'error' ? <AlertCircle className="h-3.5 w-3.5" /> : null;

  if (status === 'loading') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary-500" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Configuración"
        description="Ajustes globales del sitio"
        action={
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
              {statusIcon}
              {statusLabel}
            </span>
            <Button onClick={handleSave} disabled={status === 'saving' || !hasChanges}>
              <Save className="h-4 w-4" />
              {status === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        }
      />

      {status === 'error' && errorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}
      {status === 'saved' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success-500/30 bg-success-500/10 px-4 py-3 text-sm text-success-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Configuración actualizada correctamente
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* General */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">General</h3>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Nombre del sitio" value={settings.siteName} onChange={(v) => update('siteName', v)} />
            <Textarea label="Descripción" value={settings.siteDescription} onChange={(v) => update('siteDescription', v)} rows={2} />
            <Input label="Logo (URL)" value={settings.logo} onChange={(v) => update('logo', v)} />
            <Input label="Favicon (URL)" value={settings.favicon} onChange={(v) => update('favicon', v)} />
            <Textarea label="Texto del footer" value={settings.footerText} onChange={(v) => update('footerText', v)} rows={2} />
          </div>
        </Card>

        {/* SEO */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-accent-400" />
            <h3 className="text-sm font-semibold text-white">SEO</h3>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Meta título" value={settings.seo.metaTitle} onChange={(v) => update('seo.metaTitle', v)} />
            <Textarea label="Meta descripción" value={settings.seo.metaDescription} onChange={(v) => update('seo.metaDescription', v)} rows={2} />
            <Textarea label="Palabras clave (separadas por comas)" value={settings.seo.keywords} onChange={(v) => update('seo.keywords', v)} rows={2} />
            <Input label="Open Graph Image (URL)" value={settings.seo.ogImage} onChange={(v) => update('seo.ogImage', v)} />
          </div>
        </Card>

        {/* Social */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-success-400" />
            <h3 className="text-sm font-semibold text-white">Redes sociales</h3>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Facebook" value={settings.social.facebook} onChange={(v) => update('social.facebook', v)} />
            <Input label="Instagram" value={settings.social.instagram} onChange={(v) => update('social.instagram', v)} />
            <Input label="TikTok" value={settings.social.tiktok} onChange={(v) => update('social.tiktok', v)} />
            <Input label="Twitter / X" value={settings.social.twitter} onChange={(v) => update('social.twitter', v)} />
            <Input label="YouTube" value={settings.social.youtube} onChange={(v) => update('social.youtube', v)} />
            <Input label="LinkedIn" value={settings.social.linkedin} onChange={(v) => update('social.linkedin', v)} />
            <Input label="WhatsApp (número o enlace)" value={settings.social.whatsapp} onChange={(v) => update('social.whatsapp', v)} placeholder="https://wa.me/1234567890" />
          </div>
        </Card>

        {/* Configuración de Donaciones */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-warning-400" />
            <h3 className="text-sm font-semibold text-white">Configuración de Donaciones</h3>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={settings.donation.enabled}
                onChange={(e) => update('donation.enabled', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-ink-300">Activar donaciones</span>
            </label>
            <Input label="Enlace PayPal (paypal.me o URL completa)" value={settings.donation.paypalLink} onChange={(v) => update('donation.paypalLink', v)} placeholder="https://paypal.me/Pintando712" />
            <Input label="Correo PayPal receptor" value={settings.donation.receiverEmail} onChange={(v) => update('donation.receiverEmail', v)} placeholder="paintingdreams@pintandosueños.com" />
            <Input label="Texto del botón de donación" value={settings.donation.buttonText} onChange={(v) => update('donation.buttonText', v)} placeholder="Donar ahora" />
            <Input label="Moneda" value={settings.donation.currency} onChange={(v) => update('donation.currency', v)} placeholder="USD" />
          </div>
        </Card>

        {/* Stripe Configuration */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-400" />
            <h3 className="text-sm font-semibold text-white">Configuración de Stripe</h3>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Stripe Publishable Key" value={settings.stripe.publishableKey} onChange={(v) => update('stripe.publishableKey', v)} placeholder="pk_test_... o pk_live_..." />
            <Input label="Stripe Donation Link" value={settings.stripe.donationLink} onChange={(v) => update('stripe.donationLink', v)} placeholder="https://donate.stripe.com/..." />
            <p className="text-xs text-ink-500">Los Price IDs de las membresías se gestionan desde la página <strong className="text-ink-300">Planes</strong>.</p>
            <Select
              label="Método de donación preferido"
              value={settings.stripe.preferredDonationMethod}
              onChange={(v) => update('stripe.preferredDonationMethod', v)}
              options={[
                { value: 'stripe', label: 'Stripe' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'both', label: 'Ambos (Stripe y PayPal)' },
              ]}
            />
          </div>
        </Card>

        {/* Analytics */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Analítica</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Google Analytics ID" value={settings.analytics.googleAnalyticsId} onChange={(v) => update('analytics.googleAnalyticsId', v)} placeholder="G-XXXXXXX" />
            <Input label="Meta Pixel ID" value={settings.analytics.metaPixelId} onChange={(v) => update('analytics.metaPixelId', v)} placeholder="123456789" />
          </div>
        </Card>

        {/* Donations */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-error-400" />
            <h3 className="text-sm font-semibold text-white">Configuración de donaciones</h3>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Moneda" value={settings.currency} onChange={(v) => update('currency', v)} />
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-400">Montos predefinidos (separados por comas)</span>
              <input
                type="text"
                value={settings.donationAmounts.join(', ')}
                onChange={(e) => {
                  const amounts = e.target.value
                    .split(',')
                    .map((s) => parseInt(s.trim(), 10))
                    .filter((n) => !isNaN(n) && n > 0);
                  update('donationAmounts', amounts);
                }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-primary-500 focus:bg-white/[0.05]"
                placeholder="25, 50, 100"
              />
            </div>
          </div>
        </Card>

        {/* Subscriptions */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Repeat className="h-4 w-4 text-accent-400" />
            <h3 className="text-sm font-semibold text-white">Configuración de suscripciones</h3>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-400">Monto mínimo</span>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  type="number"
                  min={1}
                  value={settings.subscriptionSettings.minAmount}
                  onChange={(e) => update('subscriptionSettings.minAmount', parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 pl-9 text-sm text-white outline-none transition-colors focus:border-primary-500 focus:bg-white/[0.05]"
                />
              </div>
            </div>
            <Select
              label="Intervalo por defecto"
              value={settings.subscriptionSettings.defaultInterval}
              onChange={(v) => update('subscriptionSettings.defaultInterval', v)}
              options={[{ value: 'monthly', label: 'Mensual' }, { value: 'annual', label: 'Anual' }]}
            />
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={settings.subscriptionSettings.allowCustom}
                onChange={(e) => update('subscriptionSettings.allowCustom', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-ink-300">Permitir monto personalizado</span>
            </label>
          </div>
        </Card>
      </div>

      {/* Fixed bottom save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-ink-950/95 px-6 py-3 backdrop-blur-lg lg:pl-72">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
            {statusIcon}
            {statusLabel}
          </span>
          <Button onClick={handleSave} disabled={status === 'saving' || !hasChanges}>
            <Save className="h-4 w-4" />
            {status === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
