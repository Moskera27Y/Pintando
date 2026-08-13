import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card, PageHeader, Badge, EmptyState } from '@/admin/components/ui';
import { getSubscriptions } from '@/admin/services/db';
import { formatCurrency, formatDate } from '@/admin/utils/format';

import type { Subscription } from '@/admin/services/db';

type SubWithRelations = Subscription;

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  CANCELLED: 'default',
  EXPIRED: 'error',
  SUSPENDED: 'warning',
};

export function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubWithRelations[]>([]);

  useEffect(() => { getSubscriptions().then(setSubs); }, []);

  return (
    <div>
      <PageHeader title="Suscripciones" description="Membresías recurrentes de usuarios" />

      <Card className="overflow-x-auto p-0">
        {subs.length === 0 ? (
          <EmptyState message="No hay suscripciones registradas" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-ink-500">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Próximo cobro</th>
                <th className="px-4 py-3 font-medium">PayPal Sub ID</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{s.user?.firstName} {s.user?.lastName}</p>
                        <p className="text-xs text-ink-500">{s.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{s.plan?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">{s.plan ? formatCurrency(s.plan.price, s.plan.currency) : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[s.status] || 'default'}>{s.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-ink-400">{s.nextBillingDate ? formatDate(s.nextBillingDate) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-ink-500 font-mono">{s.paypalSubscriptionId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
