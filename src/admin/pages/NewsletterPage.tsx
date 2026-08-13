import { useEffect, useState } from 'react';
import { Send, Download, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, PageHeader, Badge, Button, EmptyState } from '@/admin/components/ui';
import { getNewsletter, toggleNewsletterActive, exportNewsletterCSV } from '@/admin/services/db';
import { formatDate } from '@/admin/utils/format';
import type { Newsletter } from '@/admin/services/db';

export function NewsletterPage() {
  const [subs, setSubs] = useState<Newsletter[]>([]);

  const load = () => getNewsletter().then(setSubs);
  useEffect(() => { load(); }, []);

  const handleToggle = async (id: string, active: boolean) => {
    await toggleNewsletterActive(id, !active);
    load();
  };

  const handleExport = () => {
    const csv = exportNewsletterCSV(subs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = subs.filter((s) => s.active).length;

  return (
    <div>
      <PageHeader
        title="Newsletter"
        description={`${activeCount} suscriptores activos de ${subs.length} totales`}
        action={<Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4" /> Exportar CSV</Button>}
      />

      <Card className="overflow-x-auto p-0">
        {subs.length === 0 ? (
          <EmptyState message="No hay suscriptores" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-ink-500">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Suscripción</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-primary-400" />
                      <span className="text-sm text-white">{s.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-400">{s.name || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={s.active ? 'success' : 'default'}>{s.active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td className="px-4 py-3 text-sm text-ink-400">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(s.id, s.active)} className="text-ink-400 hover:text-white">
                      {s.active ? <ToggleRight className="h-6 w-6 text-success-400" /> : <ToggleLeft className="h-6 w-6" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
