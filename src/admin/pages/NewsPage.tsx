import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Newspaper, Eye, EyeOff } from 'lucide-react';
import { Card, PageHeader, Badge, Button, Modal, Input, Textarea, EmptyState } from '@/admin/components/ui';
import { getNews, createNews, updateNews, deleteNews } from '@/admin/services/db';
import { formatDate } from '@/admin/utils/format';
import type { News } from '@/admin/services/db';
import { useAuth } from '@/admin/auth/AuthContext';

type NewsItem = News;

export function NewsPage() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState({ title: '', content: '', image: '', published: false });

  const load = () => getNews().then(setNews);
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', image: '', published: false });
    setModalOpen(true);
  };

  const openEdit = (n: NewsItem) => {
    setEditing(n);
    setForm({ title: n.title, content: n.content, image: n.image || '', published: n.published });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updateNews(editing.id, {
        title: form.title,
        content: form.content,
        image: form.image || null,
        published: form.published,
      });
    } else {
      await createNews({
        title: form.title,
        content: form.content,
        image: form.image || undefined,
        published: form.published,
        authorId: user?.id || '',
      });
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta noticia?')) {
      await deleteNews(id);
      load();
    }
  };

  const togglePublish = async (n: NewsItem) => {
    await updateNews(n.id, { published: !n.published });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Noticias"
        description="Gestión de contenido del sitio"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nueva noticia</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {news.length === 0 && <EmptyState message="No hay noticias publicadas" />}
        {news.map((n) => (
          <Card key={n.id} className="flex gap-4">
            {n.image ? (
              <img src={n.image} alt={n.title} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <Newspaper className="h-8 w-8 text-ink-600" />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-white">{n.title}</h3>
                <Badge variant={n.published ? 'success' : 'default'}>{n.published ? 'Publicado' : 'Borrador'}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-ink-500">{n.content}</p>
              <p className="mt-1 text-xs text-ink-600">/{n.slug} · {formatDate(n.createdAt)}</p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(n)}><Pencil className="h-3.5 w-3.5" /> Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => togglePublish(n)}>
                  {n.published ? <><EyeOff className="h-3.5 w-3.5" /> Despublicar</> : <><Eye className="h-3.5 w-3.5" /> Publicar</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)} className="text-error-400 hover:text-error-300"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar noticia' : 'Nueva noticia'}>
        <div className="flex flex-col gap-4">
          <Input label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Título de la noticia" required />
          <Textarea label="Contenido" value={form.content} onChange={(v) => setForm({ ...form, content: v })} placeholder="Contenido..." rows={5} required />
          <Input label="URL de imagen" value={form.image} onChange={(v) => setForm({ ...form, image: v })} placeholder="https://..." />
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-white/5" />
            Publicar inmediatamente
          </label>
          <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editing ? 'Guardar' : 'Crear noticia'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
