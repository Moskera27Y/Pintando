import { useEffect, useState } from 'react';
import { Heart, Filter } from 'lucide-react';
import { Card, PageHeader, Badge, Select, Button, EmptyState } from '@/admin/components/ui';
import { getDonations } from '@/admin/services/db';
import { formatCurrency, formatDate } from '@/admin/utils/format';
import type { Donation, DonationStatus } from '@/admin/services/db';

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  REFUNDED: 'info' as never,
  CANCELLED: 'default',
};

export function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const load = () => {
    getDonations({
      status: (statusFilter || undefined) as DonationStatus | undefined,
      from: fromFilter || undefined,
      to: toFilter || undefined,
    }).then(setDonations);
  };

  useEffect(() => { load(); }, [statusFilter, fromFilter, toFilter]);

  const total = donations.filter((d) => d.status === 'COMPLETED').reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div>
      <PageHeader title="Donaciones" description={`${donations.length} registros — ${formatCurrency(total)} recaudado`} />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Select
            label="Estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'Todos' },
              { value: 'COMPLETED', label: 'Completado' },
              { value: 'PENDING', label: 'Pendiente' },
              { value: 'FAILED', label: 'Fallido' },
              { value: 'REFUNDED', label: 'Reembolsado' },
              { value: 'CANCELLED', label: 'Cancelado' },
            ]}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-400">Desde</span>
          <input type="date" value={fromFilter} onChange={(e) => setFromFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary-500" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-400">Hasta</span>
          <input type="date" value={toFilter} onChange={(e) => setToFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary-500" />
        </label>
        <Button variant="secondary" size="md" onClick={load}><Filter className="h-4 w-4" /> Actualizar</Button>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto p-0">
        {donations.length === 0 ? (
          <EmptyState message="No hay donaciones con los filtros seleccionados" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-ink-500">
                <th className="px-4 py-3 font-medium">Donante</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">PayPal ID</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-error-400" />
                      <span className="text-sm font-medium text-white">{d.donorName || 'Anónimo'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-400">{d.donorEmail || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">{formatCurrency(Number(d.amount), d.currency)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[d.status] || 'default'}>{d.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-ink-400">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-ink-500 font-mono">{d.paypalOrderId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
