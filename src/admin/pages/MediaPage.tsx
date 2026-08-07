import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Upload, Search, Trash2, Image as ImageIcon, Video, FileText,
  Download, Copy, Edit3, Replace, X, Check, Film, LayoutGrid,
  List, HardDrive, Clock, Star, Eye, EyeOff, CheckSquare, Square,
  Maximize2, ArrowUpDown, Folder, GripVertical,
} from 'lucide-react';
import { Card, PageHeader, Button, Modal, Input, Textarea, Select, EmptyState, Badge, StatCard } from '@/admin/components/ui';
import { getMedia, createMedia, updateMedia, deleteMedia, patchMedia, getGallery, createGallery, updateGallery, deleteGallery } from '@/admin/services/db';
import { uploadFile, deleteFile, isImage, isVideo, ACCEPTED_MIME, type UploadResult } from '@/lib/supabase';
import { formatDate, formatDateShort } from '@/admin/utils/format';
import type { Media } from '@/admin/services/db';

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnail: string | null;
  displayOrder: number;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES = [
  { value: 'home', label: 'Home' },
  { value: 'hero', label: 'Hero' },
  { value: 'about', label: 'About' },
  { value: 'programs', label: 'Programs' },
  { value: 'memberships', label: 'Memberships' },
  { value: 'donations', label: 'Donations' },
  { value: 'partners', label: 'Partners' },
  { value: 'events', label: 'Events' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'videos', label: 'Videos' },
  { value: 'documents', label: 'Documents' },
  { value: 'backgrounds', label: 'Backgrounds' },
  { value: 'logos', label: 'Logos' },
  { value: 'promotional-video', label: 'Promotional Video' },
  { value: 'homepage-carousel', label: 'Homepage Carousel' },
  { value: 'miscellaneous', label: 'Other' },
];

const CATEGORY_ICONS: Record<string, typeof ImageIcon> = {
  home: ImageIcon, hero: ImageIcon, about: ImageIcon, programs: ImageIcon,
  gallery: ImageIcon, memberships: ImageIcon, donations: ImageIcon,
  partners: ImageIcon, events: ImageIcon, logos: ImageIcon,
  backgrounds: ImageIcon, videos: Film, documents: FileText,
  'promotional-video': Film,
  'homepage-carousel': ImageIcon,
  miscellaneous: ImageIcon,
};

type UploadTask = {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'done' | 'error' | 'cancelled';
  error?: string;
  result?: UploadResult;
  controller?: AbortController;
};

type SortKey = 'date' | 'name' | 'size' | 'resolution';
type TypeFilter = 'all' | 'image' | 'video' | 'document';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getFileType(mime: string | null): 'image' | 'video' | 'document' {
  if (isImage(mime || '')) return 'image';
  if (isVideo(mime || '')) return 'video';
  return 'document';
}

function getTypeIcon(mime: string | null): typeof ImageIcon {
  const t = getFileType(mime);
  return t === 'video' ? Video : t === 'image' ? ImageIcon : FileText;
}

export function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('home');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState<Media | null>(null);
  const [replacing, setReplacing] = useState<Media | null>(null);
  const [previewing, setPreviewing] = useState<Media | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', imageUrl: '' });
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    getMedia().then(setMedia).catch(() => {});
    getGallery().then(setGallery).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => ACCEPTED_MIME.includes(f.type));
    if (valid.length === 0) {
      showToast('No hay archivos válidos (jpg, png, webp, svg, gif, mp4, mov, webm, pdf)');
      return;
    }

    const tasks: UploadTask[] = valid.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'uploading' as const,
      controller: new AbortController(),
    }));
    setUploadTasks((prev) => [...prev, ...tasks]);

    for (const task of tasks) {
      try {
        const result = await uploadFile(
          task.file,
          activeCategory,
          (pct) => {
            setUploadTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, progress: pct } : t));
          },
          task.controller?.signal,
        );

        const created = await createMedia({
          title: task.file.name.replace(/\.[^.]+$/, ''),
          fileName: task.file.name,
          blobUrl: result.url,
          thumbnailUrl: result.thumbnail,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          width: result.width,
          height: result.height,
          duration: result.duration,
          category: activeCategory,
        });

        setUploadTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: 'done', result } : t));
        setMedia((prev) => [created, ...prev]);
        showToast(`"${task.file.name}" subido correctamente`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error';
        const isCancelled = msg === 'Subida cancelada';
        setUploadTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: isCancelled ? 'cancelled' : 'error', error: msg } : t));
        if (!isCancelled) showToast(`Error al subir "${task.file.name}": ${msg}`);
      }
    }

    setTimeout(() => {
      setUploadTasks((prev) => prev.filter((t) => t.status !== 'done'));
    }, 2000);
  }, [activeCategory]);

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleReplace = async (media: Media, file: File) => {
    try {
      const result = await uploadFile(file, media.category, (pct) => {
        setUploadTasks((prev) => [...prev, { id: `replace-${media.id}`, file, progress: pct, status: 'uploading' }]);
      });
      await updateMedia(media.id, {
        blobUrl: result.url,
        thumbnailUrl: result.thumbnail,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        width: result.width,
        height: result.height,
        duration: result.duration,
      });
      setUploadTasks((prev) => prev.filter((t) => t.id !== `replace-${media.id}`));
      setReplacing(null);
      showToast('Archivo reemplazado correctamente');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al reemplazar');
    }
  };

  const handleDelete = async (m: Media) => {
    if (!confirm(`¿Eliminar "${m.title}"?`)) return;
    try { await deleteFile(m.blobUrl); } catch { /* file may already be gone */ }
    await deleteMedia(m.id);
    showToast('Archivo eliminado');
    setSelected((prev) => { const n = new Set(prev); n.delete(m.id); return n; });
    load();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`¿Eliminar ${selected.size} archivos?`)) return;
    for (const id of selected) {
      const m = media.find((x) => x.id === id);
      if (m) { try { await deleteFile(m.blobUrl); } catch {} await deleteMedia(id); }
    }
    showToast(`${selected.size} archivos eliminados`);
    setSelected(new Set());
    load();
  };

  const handleBulkCategory = async () => {
    if (!bulkCategory || selected.size === 0) return;
    for (const id of selected) { await patchMedia(id, { category: bulkCategory }); }
    showToast(`Categoría cambiada para ${selected.size} archivos`);
    setBulkCategory('');
    setSelected(new Set());
    load();
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return;
    for (const id of selected) { await patchMedia(id, { status: bulkStatus }); }
    showToast(`Estado cambiado para ${selected.size} archivos`);
    setBulkStatus('');
    setSelected(new Set());
    load();
  };

  const handleToggleStatus = async (m: Media) => {
    const newStatus = m.status === 'active' ? 'inactive' : 'active';
    await patchMedia(m.id, { status: newStatus });
    load();
  };

  const handleToggleFeatured = async (m: Media) => {
    await patchMedia(m.id, { featured: !m.featured });
    load();
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    await updateMedia(editing.id, {
      title: editing.title,
      description: editing.description,
      category: editing.category,
      tags: editing.tags,
      displayOrder: editing.displayOrder,
      featured: editing.featured,
      status: editing.status,
    });
    setEditing(null);
    showToast('Cambios guardados');
    load();
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOverItem = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  };
  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === targetId) { handleDragEnd(); return; }
    const items = [...filteredMedia].sort((a, b) => a.displayOrder - b.displayOrder);
    const fromIdx = items.findIndex((m) => m.id === draggedId);
    const toIdx = items.findIndex((m) => m.id === targetId);
    if (fromIdx === -1 || toIdx === -1) { handleDragEnd(); return; }
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    handleDragEnd();
    showToast('Reordenando...');
    for (let i = 0; i < items.length; i++) {
      await patchMedia(items[i].id, { displayOrder: i });
    }
    showToast('Orden actualizado');
    load();
  };

  const handleSaveGallery = async () => {
    if (editingGallery) {
      await updateGallery(editingGallery.id, {
        title: galleryForm.title,
        description: galleryForm.description || null,
        imageUrl: galleryForm.imageUrl,
      });
    } else {
      await createGallery({
        title: galleryForm.title,
        description: galleryForm.description || undefined,
        imageUrl: galleryForm.imageUrl,
      });
    }
    setShowGalleryModal(false);
    setEditingGallery(null);
    setGalleryForm({ title: '', description: '', imageUrl: '' });
    showToast('Galería actualizada');
    load();
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return;
    await deleteGallery(id);
    showToast('Imagen eliminada de la galería');
    load();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL copiada');
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredMedia.length) setSelected(new Set());
    else setSelected(new Set(filteredMedia.map((m) => m.id)));
  };

  // ─── Derived data ──────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of media) { counts[m.category] = (counts[m.category] || 0) + 1; }
    return counts;
  }, [media]);

  const filteredMedia = useMemo(() => {
    let result = media.filter((m) => m.category === activeCategory);
    if (statusFilter !== 'all') result = result.filter((m) => m.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter((m) => getFileType(m.mimeType) === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q) || m.fileName.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.title.localeCompare(b.title);
        case 'size': return (b.fileSize || 0) - (a.fileSize || 0);
        case 'resolution': return ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0));
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return result;
  }, [media, activeCategory, statusFilter, typeFilter, search, sortBy]);

  const totalImages = media.filter((m) => isImage(m.mimeType || '')).length;
  const totalVideos = media.filter((m) => isVideo(m.mimeType || '')).length;
  const totalSize = media.reduce((s, m) => s + (m.fileSize || 0), 0);
  const activeCount = media.filter((m) => m.status === 'active').length;
  const isGalleryCategory = activeCategory === 'gallery';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Media Manager"
        description="Gestor multimedia CMS — administra imágenes, videos y documentos del sitio"
        action={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_MIME.join(',')}
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Subir archivos
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Imágenes" value={totalImages} icon={<ImageIcon className="h-4 w-4" />} accent="primary" />
        <StatCard label="Videos" value={totalVideos} icon={<Video className="h-4 w-4" />} accent="accent" />
        <StatCard label="Espacio usado" value={formatBytes(totalSize)} icon={<HardDrive className="h-4 w-4" />} accent="success" />
        <StatCard label="Archivos activos" value={activeCount} icon={<Check className="h-4 w-4" />} accent="warning" />
        <StatCard label="Total archivos" value={media.length} icon={<Folder className="h-4 w-4" />} accent="primary" />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* ─── Left sidebar: Categories ──────────────────────────────────── */}
        <div className="flex shrink-0 flex-col lg:w-56">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <Folder className="h-3.5 w-3.5" /> Categorías
            </div>
            <div className="flex flex-col gap-0.5">
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.value] || ImageIcon;
                const count = categoryCounts[cat.value] || 0;
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => { setActiveCategory(cat.value); setSelected(new Set()); }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-primary-600/15 text-primary-400 shadow-sm'
                        : 'text-ink-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-primary-400' : 'text-ink-500'}`} />
                      {cat.label}
                    </span>
                    <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${
                      isActive ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-ink-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Gallery management shortcut */}
            <div className="mt-4 border-t border-white/5 pt-3">
              <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-500">Community Gallery</div>
              <Button size="sm" variant="ghost" className="w-full" onClick={() => { setEditingGallery(null); setGalleryForm({ title: '', description: '', imageUrl: '' }); setShowGalleryModal(true); }}>
                <Upload className="h-3.5 w-3.5" /> Agregar a galería
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Right content ────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-10 pr-3 text-sm text-white placeholder-ink-500 outline-none focus:border-primary-500"
                />
              </div>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
              >
                <option value="all" className="bg-ink-950">Todos los tipos</option>
                <option value="image" className="bg-ink-950">Imágenes</option>
                <option value="video" className="bg-ink-950">Videos</option>
                <option value="document" className="bg-ink-950">Documentos</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
              >
                <option value="all" className="bg-ink-950">Todos los estados</option>
                <option value="active" className="bg-ink-950">Activos</option>
                <option value="inactive" className="bg-ink-950">Inactivos</option>
              </select>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-ink-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
                >
                  <option value="date" className="bg-ink-950">Fecha</option>
                  <option value="name" className="bg-ink-950">Nombre</option>
                  <option value="size" className="bg-ink-950">Peso</option>
                  <option value="resolution" className="bg-ink-950">Resolución</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-600/20 text-primary-400' : 'text-ink-400 hover:text-white'}`}
                  title="Vista de cuadrícula"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary-600/20 text-primary-400' : 'text-ink-400 hover:text-white'}`}
                  title="Vista de lista"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Selection bar */}
            {selected.size > 0 && (
              <div className="flex flex-col gap-2 border-t border-white/5 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-primary-400">
                    <CheckSquare className="h-4 w-4" />
                    {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
                  </span>
                  <button onClick={() => setSelected(new Set())} className="text-xs text-ink-500 hover:text-white">
                    Limpiar
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-primary-500"
                  >
                    <option value="" className="bg-ink-950">Cambiar categoría...</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-ink-950">{c.label}</option>)}
                  </select>
                  {bulkCategory && <Button size="sm" onClick={handleBulkCategory}>Aplicar</Button>}

                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-primary-500"
                  >
                    <option value="" className="bg-ink-950">Cambiar estado...</option>
                    <option value="active" className="bg-ink-950">Activo</option>
                    <option value="inactive" className="bg-ink-950">Inactivo</option>
                  </select>
                  {bulkStatus && <Button size="sm" onClick={handleBulkStatus}>Aplicar</Button>}

                  <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDropFiles}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
              dragOver ? 'border-primary-500 bg-primary-500/5' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <Upload className="mx-auto h-7 w-7 text-ink-500" />
            <p className="mt-2 text-sm text-ink-400">Arrastra archivos aquí o haz clic para subir</p>
            <p className="mt-1 text-xs text-ink-600">JPG, PNG, WebP, SVG, GIF, MP4, MOV, WebM, PDF — máximo 100 MB</p>
          </div>

          {/* Upload progress */}
          {uploadTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              {uploadTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-xs text-white">{task.file.name}</span>
                      <span className="text-xs text-ink-400">
                        {task.status === 'done' ? 'Completado' : task.status === 'error' ? 'Error' : task.status === 'cancelled' ? 'Cancelado' : `${task.progress}%`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full transition-all ${task.status === 'error' ? 'bg-error-500' : task.status === 'cancelled' ? 'bg-ink-600' : 'bg-primary-500'}`}
                        style={{ width: `${task.status === 'done' ? 100 : task.status === 'cancelled' ? task.progress : task.progress}%` }}
                      />
                    </div>
                  </div>
                  {task.status === 'uploading' && (
                    <button onClick={() => task.controller?.abort()} className="rounded p-1 text-ink-400 hover:bg-white/5 hover:text-white" title="Cancelar subida">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {task.status === 'error' && <X className="h-4 w-4 text-error-400" />}
                  {task.status === 'cancelled' && <span className="text-xs text-ink-500">Cancelado</span>}
                  {task.status === 'done' && <Check className="h-4 w-4 text-success-400" />}
                </div>
              ))}
            </div>
          )}

          {/* Gallery items (when gallery category) */}
          {isGalleryCategory && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Community Gallery</h3>
                <Button size="sm" onClick={() => { setEditingGallery(null); setGalleryForm({ title: '', description: '', imageUrl: '' }); setShowGalleryModal(true); }}>
                  <Upload className="h-3 w-3" /> Agregar imagen
                </Button>
              </div>
              {gallery.length === 0 ? (
                <EmptyState message="No hay imágenes en la galería" />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {gallery.map((item) => (
                    <Card key={item.id} className="flex flex-col gap-2 p-3">
                      <div className="aspect-video overflow-hidden rounded-lg bg-white/5">
                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <p className="truncate text-xs font-medium text-white">{item.title}</p>
                      <p className="text-[10px] text-ink-600">{formatDateShort(item.createdAt)}</p>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingGallery(item); setGalleryForm({ title: item.title, description: item.description || '', imageUrl: item.imageUrl }); setShowGalleryModal(true); }}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteGallery(item.id)} className="text-error-400 hover:text-error-300">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Media grid/list */}
          {!isGalleryCategory && (
            filteredMedia.length === 0 ? (
              <EmptyState message="No hay archivos en esta categoría" />
            ) : viewMode === 'grid' ? (
              <>
                {/* Select all bar */}
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <button onClick={toggleSelectAll} className="flex items-center gap-1.5 hover:text-white">
                    {selected.size === filteredMedia.length && filteredMedia.length > 0
                      ? <CheckSquare className="h-4 w-4 text-primary-400" />
                      : <Square className="h-4 w-4" />}
                    Seleccionar todo
                  </button>
                  <span className="text-ink-600">·</span>
                  <span>{filteredMedia.length} archivo{filteredMedia.length !== 1 ? 's' : ''}</span>
                </div>

                {activeCategory === 'homepage-carousel' && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-primary-500/20 bg-primary-500/5 px-3 py-2 text-xs text-primary-300">
                    <GripVertical className="h-3.5 w-3.5" />
                    Arrastra las imágenes para reordenar el carrusel. El orden se guarda automáticamente.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredMedia.map((m) => {
                    const Icon = getTypeIcon(m.mimeType);
                    const isSelected = selected.has(m.id);
                    const isCarousel = activeCategory === 'homepage-carousel';
                    return (
                      <div
                        key={m.id}
                        draggable={isCarousel}
                        onDragStart={isCarousel ? (e) => handleDragStart(e, m.id) : undefined}
                        onDragOver={isCarousel ? (e) => handleDragOverItem(e, m.id) : undefined}
                        onDragEnd={isCarousel ? handleDragEnd : undefined}
                        onDrop={isCarousel ? (e) => handleDrop(e, m.id) : undefined}
                        className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white/[0.03] transition-all ${
                          isSelected ? 'border-primary-500 ring-1 ring-primary-500/30' : 'border-white/10 hover:border-white/20'
                        } ${isCarousel ? 'cursor-grab active:cursor-grabbing' : ''} ${
                          isCarousel && dragOverId === m.id ? 'ring-2 ring-primary-400 border-primary-400' : ''
                        } ${isCarousel && draggedId === m.id ? 'opacity-40' : ''}`}
                      >
                        {isCarousel && (
                          <div className="absolute left-1 top-1/2 z-10 -translate-y-1/2 text-ink-500 opacity-0 transition-opacity group-hover:opacity-100">
                            <GripVertical className="h-4 w-4" />
                          </div>
                        )}
                        {/* Thumbnail */}
                        <div className="relative aspect-square cursor-pointer overflow-hidden bg-white/5" onClick={() => setPreviewing(m)}>
                          {isImage(m.mimeType || '') ? (
                            <img src={m.thumbnailUrl || m.blobUrl} alt={m.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                          ) : isVideo(m.mimeType || '') ? (
                            <video src={m.blobUrl} className="h-full w-full object-cover" muted preload="metadata" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Icon className="h-10 w-10 text-ink-600" />
                            </div>
                          )}

                          {/* Selection checkbox */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelect(m.id); }}
                            className={`absolute left-2 top-2 rounded-md p-1 transition-all ${
                              isSelected ? 'bg-primary-600 text-white' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </button>

                          {/* Badges */}
                          <div className="absolute right-2 top-2 flex gap-1">
                            {m.featured && <span className="rounded bg-warning-500/80 p-1"><Star className="h-2.5 w-2.5 text-white" /></span>}
                            {m.status === 'inactive' && <span className="rounded bg-error-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">Inactivo</span>}
                          </div>

                          {/* Hover overlay actions */}
                          <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/80 via-black/20 to-transparent pb-3 opacity-0 transition-opacity group-hover:opacity-100">
                            <button onClick={(e) => { e.stopPropagation(); setEditing(m); }} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25" title="Editar">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setReplacing(m); }} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25" title="Reemplazar">
                              <Replace className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setPreviewing(m); }} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25" title="Vista previa">
                              <Maximize2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); copyUrl(m.blobUrl); }} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25" title="Copiar URL">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <a href={m.blobUrl} download={m.fileName} onClick={(e) => e.stopPropagation()} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25" title="Descargar">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(m); }} className="rounded-lg bg-error-600/80 p-2 text-white backdrop-blur-sm transition-colors hover:bg-error-500" title="Eliminar">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card info */}
                        <div className="flex flex-col gap-1 p-3">
                          <p className="truncate text-xs font-medium text-white" title={m.title}>{m.title}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-ink-500">
                            <Icon className="h-3 w-3" />
                            <span>{m.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                            <span>·</span>
                            <span>{formatBytes(m.fileSize || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-ink-600">
                            <span>{m.width && m.height ? `${m.width}×${m.height}` : '—'}</span>
                            <span>{formatDateShort(m.createdAt)}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <button onClick={() => handleToggleFeatured(m)} className={`rounded p-1 ${m.featured ? 'text-warning-400' : 'text-ink-600 hover:text-white'}`} title="Destacado">
                              <Star className="h-3 w-3" />
                            </button>
                            <button onClick={() => handleToggleStatus(m)} className={`rounded p-1 ${m.status === 'active' ? 'text-success-400' : 'text-ink-600 hover:text-white'}`} title="Activar/Desactivar">
                              {m.status === 'active' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* ─── List view ─── */
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-ink-500">
                      <th className="px-3 py-3 w-10">
                        <button onClick={toggleSelectAll}>
                          {selected.size === filteredMedia.length && filteredMedia.length > 0
                            ? <CheckSquare className="h-4 w-4 text-primary-400" />
                            : <Square className="h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-3 py-3 font-medium">Miniatura</th>
                      <th className="px-3 py-3 font-medium">Nombre</th>
                      <th className="px-3 py-3 font-medium">Categoría</th>
                      <th className="px-3 py-3 font-medium">Tipo</th>
                      <th className="px-3 py-3 font-medium">Peso</th>
                      <th className="px-3 py-3 font-medium">Fecha</th>
                      <th className="px-3 py-3 font-medium">Estado</th>
                      <th className="px-3 py-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedia.map((m) => {
                      const Icon = getTypeIcon(m.mimeType);
                      const isSelected = selected.has(m.id);
                      return (
                        <tr key={m.id} className={`border-b border-white/5 transition-colors ${isSelected ? 'bg-primary-600/5' : 'hover:bg-white/[0.02]'}`}>
                          <td className="px-3 py-3">
                            <button onClick={() => toggleSelect(m.id)}>
                              {isSelected ? <CheckSquare className="h-4 w-4 text-primary-400" /> : <Square className="h-4 w-4 text-ink-600" />}
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-white/5">
                              {isImage(m.mimeType || '') ? (
                                <img src={m.thumbnailUrl || m.blobUrl} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                              ) : isVideo(m.mimeType || '') ? (
                                <video src={m.blobUrl} className="h-full w-full object-cover" muted preload="metadata" />
                              ) : (
                                <div className="flex h-full items-center justify-center"><Icon className="h-5 w-5 text-ink-600" /></div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <button onClick={() => setPreviewing(m)} className="truncate text-left font-medium text-white hover:text-primary-400" title={m.title}>
                              {m.title}
                            </button>
                            {m.width && m.height && <span className="block text-[10px] text-ink-600">{m.width}×{m.height}{m.duration ? ` · ${formatDuration(m.duration)}` : ''}</span>}
                          </td>
                          <td className="px-3 py-3 text-ink-400">{CATEGORIES.find((c) => c.value === m.category)?.label || m.category}</td>
                          <td className="px-3 py-3">
                            <span className="flex items-center gap-1.5 text-ink-400">
                              <Icon className="h-3.5 w-3.5" />
                              {m.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-ink-400">{formatBytes(m.fileSize || 0)}</td>
                          <td className="px-3 py-3 text-ink-500">{formatDateShort(m.createdAt)}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                              m.status === 'active' ? 'bg-success-500/15 text-success-400' : 'bg-error-500/15 text-error-400'
                            }`}>
                              {m.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setEditing(m)} className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white" title="Editar">
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setReplacing(m)} className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white" title="Reemplazar">
                                <Replace className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setPreviewing(m)} className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white" title="Vista previa">
                                <Maximize2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => copyUrl(m.blobUrl)} className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white" title="Copiar URL">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <a href={m.blobUrl} download={m.fileName} className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white" title="Descargar">
                                <Download className="h-3.5 w-3.5" />
                              </a>
                              <button onClick={() => handleDelete(m)} className="rounded-lg p-1.5 text-error-400 hover:bg-error-500/10" title="Eliminar">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal open={true} onClose={() => setEditing(null)} title="Editar archivo">
          <div className="flex flex-col gap-4">
            <Input label="Título" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <Textarea label="Descripción" value={editing.description || ''} onChange={(v) => setEditing({ ...editing, description: v })} rows={3} />
            <Select
              label="Categoría"
              value={editing.category}
              onChange={(v) => setEditing({ ...editing, category: v })}
              options={CATEGORIES}
            />
            <Input label="Etiquetas (separadas por comas)" value={editing.tags.join(', ')} onChange={(v) => setEditing({ ...editing, tags: v.split(',').map((t) => t.trim()).filter(Boolean) })} />
            <Input label="Orden de aparición (número)" type="number" value={String(editing.displayOrder)} onChange={(v) => setEditing({ ...editing, displayOrder: Number(v) || 0 })} />
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <span className="text-xs font-medium text-ink-400">Destacado</span>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, featured: !editing.featured })}
                className={`relative h-6 w-11 rounded-full transition-colors ${editing.featured ? 'bg-warning-500' : 'bg-ink-700'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${editing.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <Select
              label="Estado"
              value={editing.status}
              onChange={(v) => setEditing({ ...editing, status: v })}
              options={[{ value: 'active', label: 'Activo' }, { value: 'inactive', label: 'Inactivo' }]}
            />
            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Guardar cambios</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Replace modal */}
      {replacing && (
        <ReplaceModal media={replacing} onClose={() => setReplacing(null)} onReplace={handleReplace} />
      )}

      {/* Preview modal */}
      {previewing && (
        <PreviewModal media={previewing} onClose={() => setPreviewing(null)} onCopyUrl={copyUrl} />
      )}

      {/* Gallery modal */}
      {showGalleryModal && (
        <Modal open={true} onClose={() => setShowGalleryModal(false)} title={editingGallery ? 'Editar imagen de galería' : 'Agregar a galería'}>
          <div className="flex flex-col gap-4">
            <Input label="Título" value={galleryForm.title} onChange={(v) => setGalleryForm({ ...galleryForm, title: v })} placeholder="Título de la foto" required />
            <Textarea label="Descripción" value={galleryForm.description} onChange={(v) => setGalleryForm({ ...galleryForm, description: v })} rows={2} placeholder="Descripción opcional" />
            <Input label="URL de la imagen" value={galleryForm.imageUrl} onChange={(v) => setGalleryForm({ ...galleryForm, imageUrl: v })} placeholder="https://..." required />
            <p className="text-xs text-ink-500">Sube primero el archivo desde la zona de categorías, copia la URL y pégala aquí.</p>
            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button variant="ghost" onClick={() => setShowGalleryModal(false)}>Cancelar</Button>
              <Button onClick={handleSaveGallery} disabled={!galleryForm.title || !galleryForm.imageUrl}>Guardar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-ink-900 px-4 py-2 text-sm text-white shadow-xl border border-white/10 z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Preview Modal ───────────────────────────────────────────────────────
function PreviewModal({ media, onClose, onCopyUrl }: { media: Media; onClose: () => void; onCopyUrl: (url: string) => void }) {
  const type = getFileType(media.mimeType);
  const Icon = getTypeIcon(media.mimeType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="truncate text-lg font-semibold text-white">{media.title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6 lg:flex-row">
          {/* Preview area */}
          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-black/30" style={{ minHeight: '300px' }}>
            {type === 'image' ? (
              <img src={media.blobUrl} alt={media.title} className="max-h-[60vh] w-full object-contain" />
            ) : type === 'video' ? (
              <video src={media.blobUrl} controls className="max-h-[60vh] w-full" />
            ) : (
              <iframe src={media.blobUrl} title={media.title} className="h-[60vh] w-full" />
            )}
          </div>

          {/* Metadata sidebar */}
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                <Icon className="h-6 w-6 text-ink-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{media.fileName}</p>
                <p className="text-xs text-ink-500">{media.mimeType || 'desconocido'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
              <MetaRow label="Dimensiones" value={media.width && media.height ? `${media.width} × ${media.height} px` : '—'} />
              {media.duration ? <MetaRow label="Duración" value={formatDuration(media.duration)} /> : null}
              <MetaRow label="Peso" value={formatBytes(media.fileSize || 0)} />
              <MetaRow label="Formato" value={(media.mimeType?.split('/')[1]?.toUpperCase()) || '—'} />
              <MetaRow label="Categoría" value={CATEGORIES.find((c) => c.value === media.category)?.label || media.category} />
              <MetaRow label="Estado" value={media.status === 'active' ? 'Activo' : 'Inactivo'} />
              <MetaRow label="Fecha" value={formatDate(media.createdAt)} />
            </div>

            {/* URL + copy */}
            <div className="border-t border-white/5 pt-4">
              <p className="mb-1.5 text-xs font-medium text-ink-400">URL del archivo</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={media.blobUrl}
                  className="flex-1 truncate rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-ink-400"
                />
                <Button size="sm" onClick={() => onCopyUrl(media.blobUrl)}>
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </Button>
              </div>
            </div>

            {/* Download */}
            <a href={media.blobUrl} download={media.fileName}>
              <Button variant="secondary" className="w-full">
                <Download className="h-4 w-4" /> Descargar archivo
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-500">{label}</span>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}

// ─── Replace Modal ──────────────────────────────────────────────────────
function ReplaceModal({ media, onClose, onReplace }: { media: Media; onClose: () => void; onReplace: (m: Media, f: File) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal open={true} onClose={onClose} title={`Reemplazar: ${media.title}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
            {isImage(media.mimeType || '') ? (
              <img src={media.thumbnailUrl || media.blobUrl} alt={media.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FileText className="h-6 w-6 text-ink-600" />
              </div>
            )}
          </div>
          <div className="text-xs text-ink-400">
            <p className="font-medium text-white">{media.fileName}</p>
            <p>{media.mimeType} · {formatBytes(media.fileSize || 0)}</p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(',')}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
        />
        <div
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-white/10 p-6 text-center hover:border-white/20"
        >
          {selectedFile ? (
            <div className="flex items-center justify-center gap-2 text-sm text-white">
              <Check className="h-4 w-4 text-success-400" /> {selectedFile.name}
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-ink-500" />
              <p className="mt-2 text-sm text-ink-400">Selecciona el nuevo archivo</p>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => selectedFile && onReplace(media, selectedFile)} disabled={!selectedFile}>Reemplazar</Button>
        </div>
      </div>
    </Modal>
  );
}
