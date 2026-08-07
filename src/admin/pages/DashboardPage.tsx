import { useEffect, useState } from 'react';
import { Heart, CreditCard, Users, Mail, Send, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { StatCard, Card, PageHeader, Badge } from '@/admin/components/ui';
import { getDashboardStats, getRecentActivity } from '@/admin/services/db';
import { formatCurrency, formatDate } from '@/admin/utils/format';

type Stats = {
  totalDonations: number;
  totalRaised: number;
  activeSubs: number;
  totalUsers: number;
  pendingContacts: number;
  newsletterSubs: number;
};

type Activity = {
  id: string;
  type: string;
  action: string;
  description: string | null;
  createdAt: string;
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getRecentActivity().then((a) => setActivity(a as unknown as Activity[]));
  }, []);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Resumen general de la plataforma" />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Donaciones" value={stats.totalDonations} icon={<Heart className="h-5 w-5" />} accent="error" />
        <StatCard label="Recaudado" value={formatCurrency(stats.totalRaised)} icon={<DollarSign className="h-5 w-5" />} accent="success" />
        <StatCard label="Suscripciones activas" value={stats.activeSubs} icon={<CreditCard className="h-5 w-5" />} accent="primary" />
        <StatCard label="Usuarios" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} accent="accent" />
        <StatCard label="Mensajes pendientes" value={stats.pendingContacts} icon={<Mail className="h-5 w-5" />} accent="warning" />
        <StatCard label="Newsletter" value={stats.newsletterSubs} icon={<Send className="h-5 w-5" />} accent="primary" />
      </div>

      {/* Chart placeholder + recent activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Donation chart */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Donaciones recientes</h3>
            <ArrowUpRight className="h-4 w-4 text-ink-500" />
          </div>
          <div className="flex h-48 items-end gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 100, 60, 85, 75, 95].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary-600/40 to-primary-500 transition-all hover:from-primary-600/60 hover:to-primary-400"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-ink-600">{['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Actividad reciente</h3>
          </div>
          <div className="flex flex-col gap-3">
            {activity.length === 0 && <p className="text-sm text-ink-500">Sin actividad</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{a.description}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant="info">{a.action}</Badge>
                    <span className="text-xs text-ink-500">{formatDate(a.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
