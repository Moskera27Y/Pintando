import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/admin/components/AdminLayout';
import { ProtectedRoute } from '@/admin/auth/ProtectedRoute';
import { LoginPage } from '@/admin/pages/LoginPage';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { UsersPage } from '@/admin/pages/UsersPage';
import { DonationsPage } from '@/admin/pages/DonationsPage';
import { SubscriptionsPage } from '@/admin/pages/SubscriptionsPage';
import { PlansPage } from '@/admin/pages/PlansPage';
import { NewsPage } from '@/admin/pages/NewsPage';
import { ContactsPage } from '@/admin/pages/ContactsPage';
import { NewsletterPage } from '@/admin/pages/NewsletterPage';
import { MediaPage } from '@/admin/pages/MediaPage';
import { SettingsPage } from '@/admin/pages/SettingsPage';
import { DonationGuideAdminPage } from '@/admin/pages/DonationGuideAdminPage';

export function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="donations" element={<DonationsPage />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="newsletter" element={<NewsletterPage />} />
                <Route path="media" element={<MediaPage />} />
                <Route path="donation-guide" element={<DonationGuideAdminPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
