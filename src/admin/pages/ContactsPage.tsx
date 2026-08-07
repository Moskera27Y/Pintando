import { useEffect, useState } from 'react';
import { Mail, MailOpen, Reply, Archive } from 'lucide-react';
import { Card, PageHeader, Badge, Button, Modal, EmptyState } from '@/admin/components/ui';
import { getContacts, updateContactStatus } from '@/admin/services/db';
import { formatDate } from '@/admin/utils/format';
import type { Contact, ContactStatus } from '@/admin/services/db';

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'default'> = {
  NEW: 'warning',
  READ: 'info',
  REPLIED: 'success',
  ARCHIVED: 'default',
};

const statusLabel: Record<string, string> = {
  NEW: 'Nuevo',
  READ: 'Leído',
  REPLIED: 'Respondido',
  ARCHIVED: 'Archivado',
};

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);

  const load = () => getContacts().then(setContacts);
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: ContactStatus) => {
    await updateContactStatus(id, status);
    setSelected(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Contactos" description="Bandeja de mensajes recibidos" />

      <div className="grid grid-cols-1 gap-3">
        {contacts.length === 0 && <EmptyState message="No hay mensajes" />}
        {contacts.map((c) => (
          <Card key={c.id} className="flex items-start gap-4 hover:cursor-pointer" >
            <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.status === 'NEW' ? 'bg-warning-500/15 text-warning-400' : 'bg-white/5 text-ink-500'}`}>
              {c.status === 'NEW' ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-semibold text-white">{c.name}</span>
                  <span className="ml-2 text-xs text-ink-500">{c.email}</span>
                </div>
                <Badge variant={statusVariant[c.status]}>{statusLabel[c.status]}</Badge>
              </div>
              {c.subject && <p className="mt-0.5 text-sm font-medium text-ink-300">{c.subject}</p>}
              <p className="mt-1 line-clamp-1 text-xs text-ink-500">{c.message}</p>
              <p className="mt-1 text-xs text-ink-600">{formatDate(c.createdAt)}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setSelected(c); handleStatusChange(c.id, 'READ'); }}>Ver</Button>
          </Card>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Mensaje de contacto">
        {selected && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-white">{selected.name}</p>
              <p className="text-xs text-ink-500">{selected.email}</p>
            </div>
            {selected.subject && <p className="text-sm font-medium text-ink-300">{selected.subject}</p>}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm text-ink-300">{selected.message}</p>
            </div>
            <p className="text-xs text-ink-600">{formatDate(selected.createdAt)}</p>
            <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
              <Button size="sm" variant="primary" onClick={() => handleStatusChange(selected.id, 'REPLIED')}><Reply className="h-3.5 w-3.5" /> Marcar respondido</Button>
              <Button size="sm" variant="secondary" onClick={() => handleStatusChange(selected.id, 'READ')}>Marcar leído</Button>
              <Button size="sm" variant="ghost" onClick={() => handleStatusChange(selected.id, 'ARCHIVED')}><Archive className="h-3.5 w-3.5" /> Archivar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
