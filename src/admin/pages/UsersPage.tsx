import { useEffect, useState } from 'react';
import { Search, Shield, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { Card, PageHeader, Badge, Input, Modal, Button } from '@/admin/components/ui';
import { getUsers, updateUserRole } from '@/admin/services/db';
import { formatDate } from '@/admin/utils/format';
import type { User, Role } from '@/admin/services/db';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);

  const load = () => getUsers(search).then(setUsers);

  useEffect(() => { load(); }, [search]);

  const handleRoleChange = async (id: string, role: Role) => {
    await updateUserRole(id, role);
    setSelected(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Usuarios" description="Gestión de usuarios y roles" />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-10 pr-3 text-sm text-white placeholder-ink-500 outline-none focus:border-primary-500"
          />
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase text-ink-500">
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <span className="text-sm font-medium text-white">{u.firstName} {u.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-ink-400">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'ADMIN' ? 'info' : 'default'}>
                    {u.role === 'ADMIN' ? <ShieldCheck className="mr-1 h-3 w-3" /> : <Shield className="mr-1 h-3 w-3" />}
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-ink-400">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setSelected(u)}>Ver detalle</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalle de usuario">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg font-semibold uppercase">
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{selected.firstName} {selected.lastName}</p>
                <p className="text-sm text-ink-400">{selected.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-ink-400"><Mail className="h-4 w-4" /> {selected.email}</div>
              <div className="flex items-center gap-2 text-ink-400"><Phone className="h-4 w-4" /> {selected.phone || '—'}</div>
              <div className="flex items-center gap-2 text-ink-400"><MapPin className="h-4 w-4" /> {selected.country || '—'}, {selected.city || '—'}</div>
              <div className="flex items-center gap-2 text-ink-400"><Shield className="h-4 w-4" /> Rol: {selected.role}</div>
            </div>

            <div className="rounded-lg border border-white/10 p-4">
              <p className="mb-2 text-xs font-medium text-ink-400">Cambiar rol</p>
              <div className="flex gap-2">
                <Button size="sm" variant={selected.role === 'ADMIN' ? 'primary' : 'secondary'} onClick={() => handleRoleChange(selected.id, 'ADMIN')}>
                  <ShieldCheck className="h-4 w-4" /> Admin
                </Button>
                <Button size="sm" variant={selected.role === 'USER' ? 'primary' : 'secondary'} onClick={() => handleRoleChange(selected.id, 'USER')}>
                  <Shield className="h-4 w-4" /> User
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
