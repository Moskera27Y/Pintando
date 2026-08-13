import { useEffect, useState, useRef, type DragEvent } from 'react';
import {
  Pencil, Plus, Trash2, GripVertical, Heart, Home, Bath, Sofa, Bed, Wrench,
  PaintRoller, Sparkles, X, Upload, Save, ArrowUp, ArrowDown, Mail, FileText,
} from 'lucide-react';
import { Card, PageHeader, Badge, Button, Modal, Input, Textarea, Select } from '@/admin/components/ui';
import {
  getDonationGuideCategories,
  createDonationGuideCategory,
  updateDonationGuideCategory,
  deleteDonationGuideCategory,
  getDonationGuideHero,
  updateDonationGuideHero,
} from '@/admin/services/db';
import type { DonationGuideCategory, DonationGuideItem, DonationGuideHero } from '@/admin/services/db';
import { uploadFile } from '@/lib/supabase';
import { formatDate } from '@/admin/utils/format';
import { SponsorshipManager } from '@/admin/components/SponsorshipManager';

const ICON_OPTIONS = [
  { value: 'Heart', label: 'Heart' },
  { value: 'Home', label: 'Home' },
  { value: 'Bath', label: 'Bath' },
  { value: 'Sofa', label: 'Sofa' },
  { value: 'Bed', label: 'Bed' },
  { value: 'Wrench', label: 'Wrench' },
  { value: 'PaintRoller', label: 'Paint Roller' },
  { value: 'Sparkles', label: 'Sparkles' },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'gold', label: 'Gold' },
  { value: 'orange', label: 'Orange' },
  { value: 'accent', label: 'Accent' },
  { value: 'purple', label: 'Purple' },
];

const ICON_MAP: Record<string, typeof Heart> = {
  Heart, Home, Bath, Sofa, Bed, Wrench, PaintRoller, Sparkles,
};

type CategoryForm = {
  title: string;
  description: string;
  icon: string;
  color: string;
  imageUrl: string;
  items: DonationGuideItem[];
  sortOrder: string;
  status: string;
  contactEmail: string;
  emailSubject: string;
};

type HeroForm = {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonHref: string;
  pdfUrl: string;
  introduction: string;
};

const emptyCategoryForm: CategoryForm = {
  title: '',
  description: '',
  icon: 'Heart',
  color: 'blue',
  imageUrl: '',
  items: [],
  sortOrder: '0',
  status: 'active',
  contactEmail: 'donations@pintandosuenos.org',
  emailSubject: 'Donation Inquiry',
};

const emptyHeroForm: HeroForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  buttonText: 'Donate Now',
  buttonHref: '#donacion',
  pdfUrl: '',
  introduction: '',
};

export function DonationGuideAdminPage() {
  const [categories, setCategories] = useState<DonationGuideCategory[]>([]);
  const [hero, setHero] = useState<DonationGuideHero | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DonationGuideCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyCategoryForm);
  const [saving, setSaving] = useState(false);
  const [heroForm, setHeroForm] = useState<HeroForm>(emptyHeroForm);
  const [heroSaving, setHeroSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const dragOverIndex = useRef<number | null>(null);

  const load = async () => {
    const [cats, h] = await Promise.all([
      getDonationGuideCategories(),
      getDonationGuideHero(),
    ]);
    setCategories(cats);
    setHero(h);
    if (h) {
      setHeroForm({
        title: h.title,
        subtitle: h.subtitle || '',
        imageUrl: h.imageUrl || '',
        buttonText: h.buttonText,
        buttonHref: h.buttonHref,
        pdfUrl: h.pdfUrl || '',
        introduction: h.introduction || '',
      });
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyCategoryForm, sortOrder: String(categories.length) });
    setModalOpen(true);
  };

  const openEdit = (c: DonationGuideCategory) => {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description || '',
      icon: c.icon,
      color: c.color,
      imageUrl: c.imageUrl || '',
      items: Array.isArray(c.items) ? c.items : [],
      sortOrder: String(c.sortOrder),
      status: c.status,
      contactEmail: c.contactEmail || 'donations@pintandosuenos.org',
      emailSubject: c.emailSubject || 'Donation Inquiry',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        icon: form.icon,
        color: form.color,
        imageUrl: form.imageUrl || undefined,
        items: form.items,
        sortOrder: Number(form.sortOrder),
        status: form.status,
        contactEmail: form.contactEmail,
        emailSubject: form.emailSubject,
      };
      if (editing) {
        await updateDonationGuideCategory(editing.id, payload);
      } else {
        await createDonationGuideCategory(payload);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await deleteDonationGuideCategory(id);
    load();
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadFile(file, 'donation-guide');
      setForm((f) => ({ ...f, imageUrl: result.url }));
    } catch {
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    setHeroUploading(true);
    try {
      const result = await uploadFile(file, 'donation-guide-hero');
      setHeroForm((f) => ({ ...f, imageUrl: result.url }));
    } catch {
      alert('Error al subir la imagen');
    } finally {
      setHeroUploading(false);
    }
  };

  const handleHeroSave = async () => {
    if (!heroForm.title) return;
    setHeroSaving(true);
    try {
      await updateDonationGuideHero({
        title: heroForm.title,
        subtitle: heroForm.subtitle || undefined,
        imageUrl: heroForm.imageUrl || undefined,
        buttonText: heroForm.buttonText,
        buttonHref: heroForm.buttonHref,
        pdfUrl: heroForm.pdfUrl || undefined,
        introduction: heroForm.introduction || undefined,
      });
      load();
    } finally {
      setHeroSaving(false);
    }
  };

  const addItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { label: '', amount: 0, description: '' }] }));
  };

  const updateItem = (idx: number, field: keyof DonationGuideItem, value: string | number | boolean) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    }));
  };

  const removeItem = (idx: number) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  // Drag & Drop reordering
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex.current = index;
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    const reordered = [...categories];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((c, i) => ({ ...c, sortOrder: i }));
    setCategories(updated);
    setDragIndex(null);
    dragOverIndex.current = null;

    setReordering(true);
    try {
      await Promise.all(
        updated.map((c) => updateDonationGuideCategory(c.id, { sortOrder: c.sortOrder }))
      );
    } finally {
      setReordering(false);
    }
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const updated = reordered.map((c, i) => ({ ...c, sortOrder: i }));
    setCategories(updated);
    setReordering(true);
    try {
      await Promise.all(
        updated.map((c) => updateDonationGuideCategory(c.id, { sortOrder: c.sortOrder }))
      );
    } finally {
      setReordering(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Donation Guide"
        description="Manage the public donation guide page — hero, introduction, and material categories."
        action={
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Category</Button>
        }
      />

      {reordering && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm text-primary-400">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
          Saving order…
        </div>
      )}

      {/* Hero editor */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary-400" />
          <h3 className="text-base font-semibold text-white">Hero Section</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Input label="Title" value={heroForm.title} onChange={(v) => setHeroForm({ ...heroForm, title: v })} placeholder="Donation Guide" />
            <Textarea label="Subtitle" value={heroForm.subtitle} onChange={(v) => setHeroForm({ ...heroForm, subtitle: v })} rows={2} placeholder="See exactly how every dollar transforms a family home." />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Button Text" value={heroForm.buttonText} onChange={(v) => setHeroForm({ ...heroForm, buttonText: v })} placeholder="Donate Now" />
              <Input label="Button Link" value={heroForm.buttonHref} onChange={(v) => setHeroForm({ ...heroForm, buttonHref: v })} placeholder="#donacion" />
            </div>
            <Input label="PDF URL (optional)" value={heroForm.pdfUrl} onChange={(v) => setHeroForm({ ...heroForm, pdfUrl: v })} placeholder="https://..." />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium text-ink-400">Background Image</span>
            {heroForm.imageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-white/10">
                <img src={heroForm.imageUrl} alt="Hero preview" className="h-40 w-full object-cover" />
                <button
                  onClick={() => setHeroForm({ ...heroForm, imageUrl: '' })}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] text-ink-500 transition-colors hover:border-primary-500 hover:text-primary-400">
                {heroUploading ? (
                  <span className="text-xs">Uploading…</span>
                ) : (
                  <>
                    <Upload className="mb-1 h-6 w-6" />
                    <span className="text-xs">Click to upload image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleHeroImageUpload(f);
                  }}
                />
              </label>
            )}
            <Button variant="secondary" onClick={handleHeroSave} disabled={heroSaving}>
              <Save className="h-4 w-4" /> {heroSaving ? 'Saving…' : 'Save Hero'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Introduction editor */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-400" />
          <h3 className="text-base font-semibold text-white">Introduction Text</h3>
        </div>
        <Textarea
          label="Introduction (shown above categories)"
          value={heroForm.introduction}
          onChange={(v) => setHeroForm({ ...heroForm, introduction: v })}
          rows={6}
          placeholder="Dear Community Partner,&#10;&#10;Thank you for supporting Pintando Sueños. Below you'll find the materials and services most needed for our renovation projects."
        />
        <div className="mt-3">
          <Button variant="secondary" onClick={handleHeroSave} disabled={heroSaving}>
            <Save className="h-4 w-4" /> {heroSaving ? 'Saving…' : 'Save Introduction'}
          </Button>
        </div>
      </Card>

      {/* Categories */}
      <div className="mb-4 flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-ink-500" />
        <span className="text-sm font-medium text-ink-400">
          Drag & drop to reorder · {categories.length} categories
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, idx) => {
          const Icon = ICON_MAP[c.icon] || Heart;
          return (
            <div
              key={c.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={() => setDragIndex(null)}
              className={`transition-opacity ${dragIndex === idx ? 'opacity-40' : 'opacity-100'}`}
            >
              <Card className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 cursor-grab text-ink-600 active:cursor-grabbing" />
                    <span className="text-xs font-mono text-ink-500">#{c.sortOrder}</span>
                    <Icon className="h-5 w-5 text-primary-400" />
                    <h3 className="text-base font-semibold text-white">{c.title}</h3>
                  </div>
                  <Badge variant={c.status === 'active' ? 'success' : 'default'}>
                    {c.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {c.description && <p className="text-sm text-ink-400">{c.description}</p>}

                {c.imageUrl && (
                  <img src={c.imageUrl} alt={c.title} className="h-28 w-full rounded-lg object-cover" />
                )}

                {Array.isArray(c.items) && c.items.length > 0 && (
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-xs font-medium text-ink-400">Items ({c.items.length})</span>
                    <ul className="mt-1.5 space-y-1">
                      {c.items.slice(0, 4).map((it, i) => (
                        <li key={i} className="flex items-center justify-between text-xs text-ink-300">
                          <span className="truncate">{it.label || '—'}</span>
                          <span className="shrink-0 font-mono text-primary-400">
                            {it.amount > 0 ? `$${it.amount}` : 'Pro bono'}
                          </span>
                        </li>
                      ))}
                      {c.items.length > 4 && (
                        <li className="text-xs text-ink-500">+{c.items.length - 4} more…</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Contact info */}
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-ink-400">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{c.contactEmail}</span>
                  </div>
                  <div className="mt-1 text-xs text-ink-500">Subject: {c.emailSubject}</div>
                </div>

                <p className="text-xs text-ink-500">Updated {formatDate(c.updatedAt)}</p>

                <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                  <Button size="sm" variant="ghost" onClick={() => moveCategory(idx, 'up')} disabled={idx === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moveCategory(idx, 'down')} disabled={idx === categories.length - 1}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex-1" />
                  <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Sponsorship Levels manager */}
      <SponsorshipManager />

      {/* Category modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <div className="flex flex-col gap-4">
          <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Paint & Painting Supplies" />
          <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} placeholder="Brief description of the category" />

          {/* Image upload */}
          <div>
            <span className="text-xs font-medium text-ink-400">Category Image</span>
            {form.imageUrl ? (
              <div className="relative mt-1.5 overflow-hidden rounded-lg border border-white/10">
                <img src={form.imageUrl} alt="Preview" className="h-32 w-full object-cover" />
                <button
                  onClick={() => setForm({ ...form, imageUrl: '' })}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1.5 flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] text-ink-500 transition-colors hover:border-primary-500 hover:text-primary-400">
                {uploading ? (
                  <span className="text-xs">Uploading…</span>
                ) : (
                  <>
                    <Upload className="mb-1 h-5 w-5" />
                    <span className="text-xs">Click to upload image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Icon" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} options={ICON_OPTIONS} />
            <Select label="Color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={COLOR_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} placeholder="0" />
            <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>

          {/* Contact fields */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <span className="text-xs font-medium text-ink-400">Email Contact</span>
            <div className="mt-2 grid grid-cols-1 gap-3">
              <Input label="Contact Email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} placeholder="donations@pintandosuenos.org" />
              <Input label="Email Subject" value={form.emailSubject} onChange={(v) => setForm({ ...form, emailSubject: v })} placeholder="Donation - Paint Supplies" />
            </div>
          </div>

          {/* Items editor */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-400">Materials / Items</span>
              <Button size="sm" variant="ghost" onClick={addItem}><Plus className="h-3.5 w-3.5" /> Add</Button>
            </div>
            <div className="mt-2 space-y-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={it.label}
                      onChange={(e) => updateItem(idx, 'label', e.target.value)}
                      placeholder="Item label"
                      className="w-full rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white placeholder-ink-500 outline-none focus:border-primary-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={it.amount}
                        onChange={(e) => updateItem(idx, 'amount', Number(e.target.value))}
                        placeholder="Amount ($)"
                        className="w-24 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white placeholder-ink-500 outline-none focus:border-primary-500"
                      />
                      <input
                        type="text"
                        value={it.description || ''}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="flex-1 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white placeholder-ink-500 outline-none focus:border-primary-500"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-ink-400">
                      <input
                        type="checkbox"
                        checked={it.urgent || false}
                        onChange={(e) => updateItem(idx, 'urgent', e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/20"
                      />
                      Mark as urgent
                    </label>
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="shrink-0 rounded p-1 text-ink-500 hover:text-error-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {form.items.length === 0 && (
                <p className="text-xs text-ink-500">No items. Add one to show specific materials and amounts.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
