import type {
  User,
  Donation,
  Subscription,
  Plan,
  Contact,
  News,
  Settings,
  Newsletter,
  Media,
  EventLog,
  Role,
  DonationStatus,
  PaymentMethod,
  SubscriptionStatus,
  ContactStatus,
} from '@prisma/client';

export type {
  User,
  Donation,
  Subscription,
  Plan,
  Contact,
  News,
  Settings,
  Newsletter,
  Media,
  EventLog,
  Role,
  DonationStatus,
  PaymentMethod,
  SubscriptionStatus,
  ContactStatus,
};

export type AdminUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'role' | 'avatar'>;

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  donation: {
    enabled: boolean;
    paypalLink: string;
    receiverEmail: string;
    buttonText: string;
    currency: string;
  };
  analytics: {
    googleAnalyticsId: string;
    metaPixelId: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
};
