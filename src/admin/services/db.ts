import type {
  Role,
  DonationStatus,
  SubscriptionStatus,
  ContactStatus,
} from '@/admin/types';

export type { Role, DonationStatus, SubscriptionStatus, ContactStatus };

// ─── Local types (compatible with Prisma but using number instead of Decimal) ──
type LocalUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

type LocalDonation = {
  id: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  paypalOrderId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  message: string | null;
  createdAt: string;
  userId: string | null;
};

type LocalSubscription = {
  id: string;
  paypalSubscriptionId: string | null;
  paypalCustomerId: string | null;
  status: SubscriptionStatus;
  nextBillingDate: string | null;
  cancelAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  planId: string;
  user?: { firstName: string; lastName: string; email: string };
  plan?: { name: string; price: number; currency: string };
};

type LocalPlan = {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  price: number;
  currency: string;
  billingInterval: string;
  stripePriceId: string | null;
  benefits: string[] | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type LocalContact = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
};

type LocalNews = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: { firstName: string; lastName: string };
};

type LocalNewsletter = {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: string;
};

type LocalMedia = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  category: string;
  tags: string[];
  status: string;
  displayOrder: number;
  featured: boolean;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type LocalGallery = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnail: string | null;
  displayOrder: number;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type LocalEventLog = {
  id: string;
  type: string;
  action: string;
  resource: string | null;
  description: string | null;
  ipAddress: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  userId: string | null;
};

export type {
  LocalUser as User,
  LocalDonation as Donation,
  LocalSubscription as Subscription,
  LocalPlan as Plan,
  LocalContact as Contact,
  LocalNews as News,
  LocalNewsletter as Newsletter,
  LocalMedia as Media,
  LocalEventLog as EventLog,
};

// ─── API client ────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

function getToken(): string | null {
  return localStorage.getItem('ps_admin_token');
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('ps_admin_token');
    localStorage.removeItem('ps_admin_user');
    window.location.href = '/admin/login';
    throw new Error('Sesión expirada');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.json();
}

// ─── Dashboard stats ────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const [donations, subs, users, contacts, newsletter] = await Promise.all([
    apiFetch<LocalDonation[]>('/forms?action=donations'),
    apiFetch<LocalSubscription[]>('/forms?action=subscriptions'),
    apiFetch<LocalUser[]>('/admin?action=users'),
    apiFetch<LocalContact[]>('/forms?action=contacts'),
    apiFetch<LocalNewsletter[]>('/forms?action=newsletter'),
  ]);

  return {
    totalDonations: donations.length,
    totalRaised: donations.filter((d) => d.status === 'COMPLETED').reduce((s, d) => s + d.amount, 0),
    activeSubs: subs.filter((s) => s.status === 'ACTIVE').length,
    totalUsers: users.length,
    pendingContacts: contacts.filter((c) => c.status === 'NEW').length,
    newsletterSubs: newsletter.filter((n) => n.active).length,
  };
}

export async function getRecentActivity() {
  return apiFetch<LocalEventLog[]>('/admin?action=events');
}

// ─── Users ──────────────────────────────────────────────────────────────────
export async function getUsers(search?: string): Promise<LocalUser[]> {
  const query = search ? `&search=${encodeURIComponent(search)}` : '';
  return apiFetch<LocalUser[]>(`/admin?action=users${query}`);
}

export async function updateUserRole(id: string, role: Role) {
  return apiFetch(`/admin?action=users`, {
    method: 'PUT',
    body: JSON.stringify({ id, role }),
  });
}

// ─── Donations ───────────────────────────────────────────────────────────────
export async function getDonations(filters?: { status?: DonationStatus; userId?: string; from?: string; to?: string }): Promise<LocalDonation[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.userId) params.set('userId', filters.userId);
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  const query = params.toString() ? `&${params.toString()}` : '';
  return apiFetch<LocalDonation[]>(`/forms?action=donations${query}`);
}

// ─── Subscriptions ──────────────────────────────────────────────────────────
export async function getSubscriptions(): Promise<LocalSubscription[]> {
  return apiFetch<LocalSubscription[]>('/forms?action=subscriptions');
}

// ─── Plans ───────────────────────────────────────────────────────────────────
export async function getPlans(): Promise<LocalPlan[]> {
  return apiFetch<LocalPlan[]>('/admin?action=plans');
}

export async function updatePlan(id: string, data: Partial<Omit<LocalPlan, 'id' | 'createdAt' | 'updatedAt'>>) {
  return apiFetch('/admin?action=plans', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
}

// ─── News ────────────────────────────────────────────────────────────────────
export async function getNews(): Promise<LocalNews[]> {
  return apiFetch<LocalNews[]>('/admin?action=news');
}

export async function createNews(data: { title: string; content: string; image?: string; published: boolean; authorId: string }): Promise<LocalNews> {
  return apiFetch<LocalNews>('/admin?action=news', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateNews(id: string, data: Partial<LocalNews>) {
  return apiFetch('/admin?action=news', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
}

export async function deleteNews(id: string) {
  return apiFetch(`/admin?action=news&id=${id}`, { method: 'DELETE' });
}

// ─── Contacts ────────────────────────────────────────────────────────────────
export async function getContacts(): Promise<LocalContact[]> {
  return apiFetch<LocalContact[]>('/forms?action=contacts');
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  return apiFetch('/forms?action=contacts', { method: 'PUT', body: JSON.stringify({ id, status }) });
}

// ─── Newsletter ──────────────────────────────────────────────────────────────
export async function getNewsletter(): Promise<LocalNewsletter[]> {
  return apiFetch<LocalNewsletter[]>('/forms?action=newsletter');
}

export async function toggleNewsletterActive(id: string, active: boolean) {
  return apiFetch('/forms?action=newsletter', { method: 'PUT', body: JSON.stringify({ id, active }) });
}

export function exportNewsletterCSV(subs: LocalNewsletter[]): string {
  const rows = subs.map((n) => [n.email, n.name || '', n.active ? 'Activo' : 'Inactivo', new Date(n.createdAt).toISOString()]);
  return [['Email', 'Nombre', 'Estado', 'Fecha'], ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
}

// ─── Media (CMS Multimedia) ──────────────────────────────────────────────────
export async function getMedia(filters?: { category?: string; status?: string; search?: string }): Promise<LocalMedia[]> {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<LocalMedia[]>(`/media${query}`);
}

export async function createMedia(data: {
  title: string;
  description?: string;
  fileName: string;
  blobUrl: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  category: string;
  tags?: string[];
  featured?: boolean;
}): Promise<LocalMedia> {
  return apiFetch<LocalMedia>('/media', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMedia(id: string, data: Partial<Omit<LocalMedia, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LocalMedia> {
  return apiFetch<LocalMedia>('/media', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
}

export async function patchMedia(id: string, data: Partial<Pick<LocalMedia, 'category' | 'displayOrder' | 'status' | 'featured'>>): Promise<LocalMedia> {
  return apiFetch<LocalMedia>('/media', { method: 'PATCH', body: JSON.stringify({ id, ...data }) });
}

export async function deleteMedia(id: string) {
  return apiFetch(`/media?id=${id}`, { method: 'DELETE' });
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export async function getGallery(): Promise<LocalGallery[]> {
  return apiFetch<LocalGallery[]>('/admin?action=gallery');
}

export async function createGallery(data: {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnail?: string;
  displayOrder?: number;
  featured?: boolean;
  status?: string;
}): Promise<LocalGallery> {
  return apiFetch<LocalGallery>('/admin?action=gallery', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateGallery(id: string, data: Partial<Omit<LocalGallery, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LocalGallery> {
  return apiFetch<LocalGallery>('/admin?action=gallery', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
}

export async function deleteGallery(id: string) {
  return apiFetch(`/admin?action=gallery&id=${id}`, { method: 'DELETE' });
}

// ─── Donation Guide ──────────────────────────────────────────────────────────
export type DonationGuideItem = {
  label: string;
  amount: number;
  description?: string;
  urgent?: boolean;
};

export type DonationGuideCategory = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  imageUrl: string | null;
  items: DonationGuideItem[];
  sortOrder: number;
  status: string;
  contactEmail: string;
  emailSubject: string;
  createdAt: string;
  updatedAt: string;
};

export type DonationGuideHero = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string;
  buttonHref: string;
  pdfUrl: string | null;
  introduction: string | null;
  updatedAt: string;
};

export async function getDonationGuideCategories(): Promise<DonationGuideCategory[]> {
  return apiFetch<DonationGuideCategory[]>('/donation-guide?action=categories');
}

export async function createDonationGuideCategory(data: {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  imageUrl?: string;
  items?: DonationGuideItem[];
  sortOrder?: number;
  status?: string;
  contactEmail?: string;
  emailSubject?: string;
}): Promise<DonationGuideCategory> {
  return apiFetch<DonationGuideCategory>('/donation-guide?action=categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDonationGuideCategory(id: string, data: Partial<Omit<DonationGuideCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DonationGuideCategory> {
  return apiFetch<DonationGuideCategory>('/donation-guide?action=categories', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteDonationGuideCategory(id: string) {
  return apiFetch(`/donation-guide?action=categories&id=${id}`, { method: 'DELETE' });
}

export async function getDonationGuideHero(): Promise<DonationGuideHero | null> {
  return apiFetch<DonationGuideHero | null>('/donation-guide?action=hero');
}

export async function updateDonationGuideHero(data: Partial<Omit<DonationGuideHero, 'id' | 'updatedAt'>>): Promise<DonationGuideHero> {
  return apiFetch<DonationGuideHero>('/donation-guide?action=hero', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Sponsorship Levels ─────────────────────────────────────────────────────
export type SponsorshipLevel = {
  id: string;
  nameEn: string;
  nameEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  minAmount: number;
  maxAmount: number | null;
  buttonTextEn: string;
  buttonTextEs: string;
  buttonAction: string;
  icon: string;
  color: string;
  featured: boolean;
  status: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  benefitLevels?: SponsorshipBenefitLevel[];
};

export type SponsorshipBenefit = {
  id: string;
  textEn: string;
  textEs: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  benefitLevels?: SponsorshipBenefitLevel[];
};

export type SponsorshipBenefitLevel = {
  id: string;
  benefitId: string;
  levelId: string;
  included: boolean;
};

export type SponsorshipSection = {
  id: string;
  titleEn: string;
  titleEs: string;
  subtitleEn: string;
  subtitleEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  updatedAt: string;
};

export async function getSponsorshipLevels(): Promise<SponsorshipLevel[]> {
  return apiFetch<SponsorshipLevel[]>('/donation-guide?action=sponsorship-levels');
}

export async function createSponsorshipLevel(data: {
  nameEn: string;
  nameEs: string;
  descriptionEn?: string;
  descriptionEs?: string;
  minAmount?: number;
  maxAmount?: number;
  buttonTextEn?: string;
  buttonTextEs?: string;
  buttonAction?: string;
  icon?: string;
  color?: string;
  featured?: boolean;
  status?: string;
  displayOrder?: number;
}): Promise<SponsorshipLevel> {
  return apiFetch<SponsorshipLevel>('/donation-guide?action=sponsorship-levels', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSponsorshipLevel(id: string, data: Partial<Omit<SponsorshipLevel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SponsorshipLevel> {
  return apiFetch<SponsorshipLevel>('/donation-guide?action=sponsorship-levels', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });
}

export async function patchSponsorshipLevel(id: string, data: Partial<Pick<SponsorshipLevel, 'featured' | 'status' | 'displayOrder'>>): Promise<SponsorshipLevel> {
  return apiFetch<SponsorshipLevel>('/donation-guide?action=sponsorship-levels', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteSponsorshipLevel(id: string) {
  return apiFetch(`/donation-guide?action=sponsorship-levels&id=${id}`, { method: 'DELETE' });
}

export async function getSponsorshipBenefits(): Promise<SponsorshipBenefit[]> {
  return apiFetch<SponsorshipBenefit[]>('/donation-guide?action=sponsorship-benefits');
}

export async function createSponsorshipBenefit(data: {
  textEn: string;
  textEs: string;
  displayOrder?: number;
}): Promise<SponsorshipBenefit> {
  return apiFetch<SponsorshipBenefit>('/donation-guide?action=sponsorship-benefits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSponsorshipBenefit(id: string, data: Partial<Omit<SponsorshipBenefit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SponsorshipBenefit> {
  return apiFetch<SponsorshipBenefit>('/donation-guide?action=sponsorship-benefits', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteSponsorshipBenefit(id: string) {
  return apiFetch(`/donation-guide?action=sponsorship-benefits&id=${id}`, { method: 'DELETE' });
}

export async function getSponsorshipMatrix(): Promise<SponsorshipBenefitLevel[]> {
  return apiFetch<SponsorshipBenefitLevel[]>('/donation-guide?action=sponsorship-matrix');
}

export async function updateMatrixCell(benefitId: string, levelId: string, included: boolean): Promise<SponsorshipBenefitLevel> {
  return apiFetch<SponsorshipBenefitLevel>('/donation-guide?action=sponsorship-matrix', {
    method: 'PUT',
    body: JSON.stringify({ benefitId, levelId, included }),
  });
}

export async function getSponsorshipSection(): Promise<SponsorshipSection | null> {
  return apiFetch<SponsorshipSection | null>('/donation-guide?action=sponsorship-section');
}

export async function updateSponsorshipSection(data: Partial<Omit<SponsorshipSection, 'id' | 'updatedAt'>>): Promise<SponsorshipSection> {
  return apiFetch<SponsorshipSection>('/donation-guide?action=sponsorship-section', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Settings ────────────────────────────────────────────────────────────────
export type SiteSettings = {
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
  donation: {
    enabled: boolean;
    paypalLink: string;
    receiverEmail: string;
    buttonText: string;
    currency: string;
  };
  stripe: {
    publishableKey: string;
    donationLink: string;
    preferredDonationMethod: 'stripe' | 'paypal' | 'both';
  };
  analytics: {
    googleAnalyticsId: string;
    metaPixelId: string;
  };
  currency: string;
  donationAmounts: number[];
  subscriptionSettings: {
    minAmount: number;
    defaultInterval: 'monthly' | 'annual';
    allowCustom: boolean;
  };
};

export async function getSettings(): Promise<SiteSettings> {
  return apiFetch<SiteSettings>('/settings');
}

export async function updateSettings(data: SiteSettings): Promise<SiteSettings> {
  return apiFetch<SiteSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Event Logs ───────────────────────────────────────────────────────────────
export async function getEventLogs(): Promise<LocalEventLog[]> {
  return apiFetch<LocalEventLog[]>('/admin?action=events');
}
