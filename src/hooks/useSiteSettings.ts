import { useEffect, useState } from 'react';

export type PublicSettings = {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  footerText: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    twitter: string;
    youtube: string;
    linkedin: string;
    whatsapp: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
  currency: string;
  donationAmounts: number[];
  donation: {
    enabled: boolean;
    paypalLink: string;
    buttonText: string;
    currency: string;
  };
  stripe: {
    publishableKey: string;
    donationLink: string;
    preferredDonationMethod: 'stripe' | 'paypal' | 'both';
  };
};

const FALLBACK: PublicSettings = {
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
  currency: 'USD',
  donationAmounts: [25, 50, 100],
  donation: {
    enabled: true,
    paypalLink: 'https://paypal.me/Pintando712',
    buttonText: 'Donar ahora',
    currency: 'USD',
  },
  stripe: {
    publishableKey: '',
    donationLink: 'https://donate.stripe.com/test_3cI9AVgzK6fu3SU5KF1Jm00',
    preferredDonationMethod: 'both',
  },
};

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

let cached: PublicSettings | null = null;
let inflight: Promise<PublicSettings> | null = null;

function mergeWithFallback(data: Partial<PublicSettings>): PublicSettings {
  return {
    siteName: data.siteName || FALLBACK.siteName,
    siteDescription: data.siteDescription || FALLBACK.siteDescription,
    logo: data.logo || FALLBACK.logo,
    favicon: data.favicon || FALLBACK.favicon,
    footerText: data.footerText || FALLBACK.footerText,
    social: {
      facebook: data.social?.facebook || FALLBACK.social.facebook,
      instagram: data.social?.instagram || FALLBACK.social.instagram,
      tiktok: data.social?.tiktok || FALLBACK.social.tiktok,
      twitter: data.social?.twitter || FALLBACK.social.twitter,
      youtube: data.social?.youtube || FALLBACK.social.youtube,
      linkedin: data.social?.linkedin || FALLBACK.social.linkedin,
      whatsapp: data.social?.whatsapp || FALLBACK.social.whatsapp,
    },
    seo: {
      metaTitle: data.seo?.metaTitle || FALLBACK.seo.metaTitle,
      metaDescription: data.seo?.metaDescription || FALLBACK.seo.metaDescription,
      keywords: data.seo?.keywords || FALLBACK.seo.keywords,
      ogImage: data.seo?.ogImage || FALLBACK.seo.ogImage,
    },
    currency: data.currency || FALLBACK.currency,
    donationAmounts: data.donationAmounts?.length ? data.donationAmounts : FALLBACK.donationAmounts,
    donation: {
      enabled: data.donation?.enabled ?? FALLBACK.donation.enabled,
      paypalLink: data.donation?.paypalLink || FALLBACK.donation.paypalLink,
      buttonText: data.donation?.buttonText || FALLBACK.donation.buttonText,
      currency: data.donation?.currency || FALLBACK.donation.currency,
    },
    stripe: {
      publishableKey: data.stripe?.publishableKey || FALLBACK.stripe.publishableKey,
      donationLink: data.stripe?.donationLink || FALLBACK.stripe.donationLink,
      preferredDonationMethod: data.stripe?.preferredDonationMethod || FALLBACK.stripe.preferredDonationMethod,
    },
  };
}

async function fetchSettings(): Promise<PublicSettings> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch(`${API_BASE}/settings?action=public`)
    .then((r) => (r.ok ? r.json() : FALLBACK))
    .then((data: Partial<PublicSettings>) => {
      cached = mergeWithFallback(data);
      return cached;
    })
    .catch(() => FALLBACK)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<PublicSettings>(cached || FALLBACK);

  useEffect(() => {
    if (cached) return;
    let active = true;
    fetchSettings().then((s) => {
      if (active) setSettings(s);
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}

export function refreshSiteSettings() {
  cached = null;
  return fetchSettings();
}
