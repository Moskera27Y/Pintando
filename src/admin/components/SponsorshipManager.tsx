import { useEffect, useState, useRef, type DragEvent } from 'react';
import {
  Pencil, Plus, Trash2, GripVertical, Award, Crown, Star, Medal, Gem,
  Trophy, Heart, Sparkles, Shield, Zap, Save, ArrowUp, ArrowDown,
  Check, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Textarea, Select } from '@/admin/components/ui';
import {
  getSponsorshipLevels,
  createSponsorshipLevel,
  updateSponsorshipLevel,
  patchSponsorshipLevel,
  deleteSponsorshipLevel,
  getSponsorshipBenefits,
  createSponsorshipBenefit,
  updateSponsorshipBenefit,
  deleteSponsorshipBenefit,
  getSponsorshipMatrix,
  updateMatrixCell,
  getSponsorshipSection,
  updateSponsorshipSection,
} from '@/admin/services/db';
import type {
  SponsorshipLevel,
  SponsorshipBenefit,
  SponsorshipBenefitLevel,
  SponsorshipSection,
} from '@/admin/services/db';
import { formatDate } from '@/admin/utils/format';

const SPONSOR_ICONS = [
  { value: 'Award', label: 'Award' },
  { value: 'Crown', label: 'Crown' },
  { value: 'Star', label: 'Star' },
  { value: 'Medal', label: 'Medal' },
  { value: 'Gem', label: 'Gem' },
  { value: 'Trophy', label: 'Trophy' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Sparkles', label: 'Sparkles' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Zap', label: 'Zap' },
];

const SPONSOR_COLORS = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'gold', label: 'Gold' },
  { value: 'orange', label: 'Orange' },
  { value: 'accent', label: 'Accent' },
  { value: 'purple', label: 'Purple' },
];

const ICON_MAP: Record<string, typeof Award> = {
  Award, Crown, Star, Medal, Gem, Trophy, Heart, Sparkles, Shield, Zap,
};

const COLOR_DOT: Record<string, string> = {
  blue: 'bg-primary-500',
  green: 'bg-success-500',
  gold: 'bg-warning-500',
  orange: 'bg-orange-500',
  accent: 'bg-accent-500',
  purple: 'bg-purple-500',
};

type LevelForm = {
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  minAmount: string;
  maxAmount: string;
  buttonTextEn: string;
  buttonTextEs: string;
  buttonAction: string;
  icon: string;
  color: string;
  featured: boolean;
  status: string;
  displayOrder: string;
};

const emptyLevelForm: LevelForm = {
  nameEn: '',
  nameEs: '',
  descriptionEn: '',
  descriptionEs: '',
  minAmount: '0',
  maxAmount: '',
  buttonTextEn: 'Donate',
  buttonTextEs: 'Donar',
  buttonAction: 'both',
  icon: 'Award',
  color: 'blue',
  featured: false,
  status: 'active',
  displayOrder: '0',
};

type BenefitForm = {
  textEn: string;
  textEs: string;
  displayOrder: string;
};

const emptyBenefitForm: BenefitForm = {
  textEn: '',
  textEs: '',
  displayOrder: '0',
};

type SectionForm = {
  titleEn: string;
  titleEs: string;
  subtitleEn: string;
  subtitleEs: string;
  descriptionEn: string;
  descriptionEs: string;
};

const emptySectionForm: SectionForm = {
  titleEn: 'Become a Community Sponsor',
  titleEs: 'Niveles de Patrocinio',
  subtitleEn: 'Join us in transforming homes and changing lives.',
  subtitleEs: 'Únase a nosotros como socio comunitario y transforme vidas.',
  descriptionEn: '',
  descriptionEs: '',
};

export function SponsorshipManager() {
  const [levels, setLevels] = useState<SponsorshipLevel[]>([]);
  const [benefits, setBenefits] = useState<SponsorshipBenefit[]>([]);
  const [matrix, setMatrix] = useState<SponsorshipBenefitLevel[]>([]);
  const [section, setSection] = useState<SponsorshipSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<SponsorshipLevel | null>(null);
  const [levelForm, setLevelForm] = useState<LevelForm>(emptyLevelForm);
  const [levelSaving, setLevelSaving] = useState(false);

  const [benefitModalOpen, setBenefitModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<SponsorshipBenefit | null>(null);
  const [benefitForm, setBenefitForm] = useState<BenefitForm>(emptyBenefitForm);
  const [benefitSaving, setBenefitSaving] = useState(false);

  const [sectionForm, setSectionForm] = useState<SectionForm>(emptySectionForm);
  const [sectionSaving, setSectionSaving] = useState(false);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const dragOverIndex = useRef<number | null>(null);

  const [benefitDragIndex, setBenefitDragIndex] = useState<number | null>(null);
  const [benefitReordering, setBenefitReordering] = useState(false);
  const benefitDragOverIndex = useRef<number | null>(null);

  const load = async () => {
    try {
      const [lvls, bens, mtx, sect] = await Promise.all([
        getSponsorshipLevels(),
        getSponsorshipBenefits(),
        getSponsorshipMatrix(),
        getSponsorshipSection(),
      ]);
      setLevels(lvls);
      setBenefits(bens);
      setMatrix(mtx);
      setSection(sect);
      if (sect) {
        setSectionForm({
          titleEn: sect.titleEn,
          titleEs: sect.titleEs,
          subtitleEn: sect.subtitleEn,
          subtitleEs: sect.subtitleEs,
          descriptionEn: sect.descriptionEn || '',
          descriptionEs: sect.descriptionEs || '',
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Levels ──────────────────────────────────────────────────────────
  const openCreateLevel = () => {
    setEditingLevel(null);
    setLevelForm({ ...emptyLevelForm, displayOrder: String(levels.length) });
    setLevelModalOpen(true);
  };

  const openEditLevel = (l: SponsorshipLevel) => {
    setEditingLevel(l);
    setLevelForm({
      nameEn: l.nameEn,
      nameEs: l.nameEs,
      descriptionEn: l.descriptionEn || '',
      descriptionEs: l.descriptionEs || '',
      minAmount: String(l.minAmount),
      maxAmount: l.maxAmount != null ? String(l.maxAmount) : '',
      buttonTextEn: l.buttonTextEn,
      buttonTextEs: l.buttonTextEs,
      buttonAction: l.buttonAction,
      icon: l.icon,
      color: l.color,
      featured: l.featured,
      status: l.status,
      displayOrder: String(l.displayOrder),
    });
    setLevelModalOpen(true);
  };

  const handleLevelSubmit = async () => {
    if (!levelForm.nameEn || !levelForm.nameEs) return;
    setLevelSaving(true);
    try {
      const payload = {
        nameEn: levelForm.nameEn,
        nameEs: levelForm.nameEs,
        descriptionEn: levelForm.descriptionEn || undefined,
        descriptionEs: levelForm.descriptionEs || undefined,
        minAmount: Number(levelForm.minAmount) || 0,
        maxAmount: levelForm.maxAmount ? Number(levelForm.maxAmount) : undefined,
        buttonTextEn: levelForm.buttonTextEn,
        buttonTextEs: levelForm.buttonTextEs,
        buttonAction: levelForm.buttonAction,
        icon: levelForm.icon,
        color: levelForm.color,
        featured: levelForm.featured,
        status: levelForm.status,
        displayOrder: Number(levelForm.displayOrder) || 0,
      };
      if (editingLevel) {
        await updateSponsorshipLevel(editingLevel.id, payload);
      } else {
        await createSponsorshipLevel(payload);
      }
      setLevelModalOpen(false);
      load();
    } finally {
      setLevelSaving(false);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm('Delete this sponsorship level?')) return;
    await deleteSponsorshipLevel(id);
    load();
  };

  const handleLevelDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLevelDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex.current = index;
  };

  const handleLevelDrop = async (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    const reordered = [...levels];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((l, i) => ({ ...l, displayOrder: i }));
    setLevels(updated);
    setDragIndex(null);
    dragOverIndex.current = null;
    setReordering(true);
    try {
      await Promise.all(updated.map((l) => patchSponsorshipLevel(l.id, { displayOrder: l.displayOrder })));
    } finally {
      setReordering(false);
    }
  };

  const moveLevel = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= levels.length) return;
    const reordered = [...levels];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const updated = reordered.map((l, i) => ({ ...l, displayOrder: i }));
    setLevels(updated);
    setReordering(true);
    try {
      await Promise.all(updated.map((l) => patchSponsorshipLevel(l.id, { displayOrder: l.displayOrder })));
    } finally {
      setReordering(false);
    }
  };

  const toggleLevelFeatured = async (l: SponsorshipLevel) => {
    await patchSponsorshipLevel(l.id, { featured: !l.featured });
    load();
  };

  const toggleLevelStatus = async (l: SponsorshipLevel) => {
    const newStatus = l.status === 'active' ? 'inactive' : 'active';
    await patchSponsorshipLevel(l.id, { status: newStatus });
    load();
  };

  // ── Benefits ────────────────────────────────────────────────────────
  const openCreateBenefit = () => {
    setEditingBenefit(null);
    setBenefitForm({ ...emptyBenefitForm, displayOrder: String(benefits.length) });
    setBenefitModalOpen(true);
  };

  const openEditBenefit = (b: SponsorshipBenefit) => {
    setEditingBenefit(b);
    setBenefitForm({
      textEn: b.textEn,
      textEs: b.textEs,
      displayOrder: String(b.displayOrder),
    });
    setBenefitModalOpen(true);
  };

  const handleBenefitSubmit = async () => {
    if (!benefitForm.textEn || !benefitForm.textEs) return;
    setBenefitSaving(true);
    try {
      const payload = {
        textEn: benefitForm.textEn,
        textEs: benefitForm.textEs,
        displayOrder: Number(benefitForm.displayOrder) || 0,
      };
      if (editingBenefit) {
        await updateSponsorshipBenefit(editingBenefit.id, payload);
      } else {
        await createSponsorshipBenefit(payload);
      }
      setBenefitModalOpen(false);
      load();
    } finally {
      setBenefitSaving(false);
    }
  };

  const handleDeleteBenefit = async (id: string) => {
    if (!confirm('Delete this benefit? It will be removed from all levels.')) return;
    await deleteSponsorshipBenefit(id);
    load();
  };

  const handleBenefitDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setBenefitDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBenefitDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    benefitDragOverIndex.current = index;
  };

  const handleBenefitDrop = async (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (benefitDragIndex === null || benefitDragIndex === dropIndex) {
      setBenefitDragIndex(null);
      return;
    }
    const reordered = [...benefits];
    const [moved] = reordered.splice(benefitDragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((b, i) => ({ ...b, displayOrder: i }));
    setBenefits(updated);
    setBenefitDragIndex(null);
    benefitDragOverIndex.current = null;
    setBenefitReordering(true);
    try {
      await Promise.all(updated.map((b) => updateSponsorshipBenefit(b.id, { displayOrder: b.displayOrder })));
    } finally {
      setBenefitReordering(false);
    }
  };

  const moveBenefit = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= benefits.length) return;
    const reordered = [...benefits];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const updated = reordered.map((b, i) => ({ ...b, displayOrder: i }));
    setBenefits(updated);
    setBenefitReordering(true);
    try {
      await Promise.all(updated.map((b) => updateSponsorshipBenefit(b.id, { displayOrder: b.displayOrder })));
    } finally {
      setBenefitReordering(false);
    }
  };

  // ── Matrix ──────────────────────────────────────────────────────────
  const isCellIncluded = (benefitId: string, levelId: string): boolean => {
    const cell = matrix.find((m) => m.benefitId === benefitId && m.levelId === levelId);
    return cell ? cell.included : false;
  };

  const handleCellToggle = async (benefitId: string, levelId: string, checked: boolean) => {
    setMatrix((prev) => {
      const existing = prev.find((m) => m.benefitId === benefitId && m.levelId === levelId);
      if (existing) {
        return prev.map((m) => (m.benefitId === benefitId && m.levelId === levelId ? { ...m, included: checked } : m));
      }
      return [...prev, { id: '', benefitId, levelId, included: checked }];
    });
    try {
      await updateMatrixCell(benefitId, levelId, checked);
    } catch {
      load();
    }
  };

  // ── Section header ──────────────────────────────────────────────────
  const handleSectionSave = async () => {
    setSectionSaving(true);
    try {
      await updateSponsorshipSection({
        titleEn: sectionForm.titleEn,
        titleEs: sectionForm.titleEs,
        subtitleEn: sectionForm.subtitleEn,
        subtitleEs: sectionForm.subtitleEs,
        descriptionEn: sectionForm.descriptionEn || undefined,
        descriptionEs: sectionForm.descriptionEs || undefined,
      });
      load();
    } finally {
      setSectionSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-8">
      {/* Collapsible header */}
      <Card className="mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent-400" />
            <h2 className="text-lg font-bold text-white">Sponsorship Levels</h2>
            <Badge variant="info">{levels.length} levels · {benefits.length} benefits</Badge>
          </div>
          {expanded ? <ChevronUp className="h-5 w-5 text-ink-400" /> : <ChevronDown className="h-5 w-5 text-ink-400" />}
        </button>
      </Card>

      {expanded && (
        <>
          {/* Section header editor */}
          <Card className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-400" />
              <h3 className="text-sm font-semibold text-white">Section Header (EN / ES)</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <Input label="Title (EN)" value={sectionForm.titleEn} onChange={(v) => setSectionForm({ ...sectionForm, titleEn: v })} placeholder="Become a Community Sponsor" />
                <Input label="Subtitle (EN)" value={sectionForm.subtitleEn} onChange={(v) => setSectionForm({ ...sectionForm, subtitleEn: v })} placeholder="Join us in transforming homes..." />
                <Textarea label="Description (EN)" value={sectionForm.descriptionEn} onChange={(v) => setSectionForm({ ...sectionForm, descriptionEn: v })} rows={3} placeholder="Your sponsorship directly funds..." />
              </div>
              <div className="flex flex-col gap-3">
                <Input label="Title (ES)" value={sectionForm.titleEs} onChange={(v) => setSectionForm({ ...sectionForm, titleEs: v })} placeholder="Niveles de Patrocinio" />
                <Input label="Subtitle (ES)" value={sectionForm.subtitleEs} onChange={(v) => setSectionForm({ ...sectionForm, subtitleEs: v })} placeholder="Únase a nosotros..." />
                <Textarea label="Description (ES)" value={sectionForm.descriptionEs} onChange={(v) => setSectionForm({ ...sectionForm, descriptionEs: v })} rows={3} placeholder="Su patrocinio financia directamente..." />
              </div>
            </div>
            <div className="mt-3">
              <Button variant="secondary" onClick={handleSectionSave} disabled={sectionSaving}>
                <Save className="h-4 w-4" /> {sectionSaving ? 'Saving…' : 'Save Section Header'}
              </Button>
            </div>
          </Card>

          {/* Levels */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-ink-500" />
              <span className="text-sm font-medium text-ink-400">Sponsorship Levels · drag & drop to reorder</span>
            </div>
            <Button size="sm" onClick={openCreateLevel}><Plus className="h-4 w-4" /> New Level</Button>
          </div>

          {reordering && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm text-primary-400">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
              Saving order…
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((l, idx) => {
              const Icon = ICON_MAP[l.icon] || Award;
              return (
                <div
                  key={l.id}
                  draggable
                  onDragStart={(e) => handleLevelDragStart(e, idx)}
                  onDragOver={(e) => handleLevelDragOver(e, idx)}
                  onDrop={(e) => handleLevelDrop(e, idx)}
                  onDragEnd={() => setDragIndex(null)}
                  className={`transition-opacity ${dragIndex === idx ? 'opacity-40' : 'opacity-100'}`}
                >
                  <Card className="flex h-full flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 cursor-grab text-ink-600 active:cursor-grabbing" />
                        <span className={`h-3 w-3 rounded-full ${COLOR_DOT[l.color] || 'bg-primary-500'}`} />
                        <Icon className="h-5 w-5 text-primary-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {l.featured && <Badge variant="warning">Featured</Badge>}
                        <Badge variant={l.status === 'active' ? 'success' : 'default'}>
                          {l.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{l.nameEn}</h3>
                      <p className="text-xs text-ink-400">{l.nameEs}</p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                      <p className="text-xs text-ink-400">Range</p>
                      <p className="text-sm font-mono text-primary-400">
                        ${Number(l.minAmount).toLocaleString()}{l.maxAmount != null ? ` – $${Number(l.maxAmount).toLocaleString()}` : '+'}
                      </p>
                    </div>
                    {l.descriptionEn && <p className="text-xs text-ink-400 line-clamp-2">{l.descriptionEn}</p>}
                    <p className="text-xs text-ink-500">Updated {formatDate(l.updatedAt)}</p>
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
                      <Button size="sm" variant="ghost" onClick={() => moveLevel(idx, 'up')} disabled={idx === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => moveLevel(idx, 'down')} disabled={idx === levels.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <div className="flex-1" />
                      <Button size="sm" variant="ghost" onClick={() => toggleLevelFeatured(l)}>
                        {l.featured ? <Star className="h-3.5 w-3.5 text-warning-400" /> : <Star className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleLevelStatus(l)}>
                        {l.status === 'active' ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openEditLevel(l)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteLevel(l.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Benefits list */}
          <div className="mt-8 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-ink-500" />
              <span className="text-sm font-medium text-ink-400">Benefits · drag & drop to reorder</span>
            </div>
            <Button size="sm" onClick={openCreateBenefit}><Plus className="h-4 w-4" /> New Benefit</Button>
          </div>

          {benefitReordering && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm text-primary-400">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
              Saving order…
            </div>
          )}

          <div className="space-y-2">
            {benefits.map((b, idx) => (
              <div
                key={b.id}
                draggable
                onDragStart={(e) => handleBenefitDragStart(e, idx)}
                onDragOver={(e) => handleBenefitDragOver(e, idx)}
                onDrop={(e) => handleBenefitDrop(e, idx)}
                onDragEnd={() => setBenefitDragIndex(null)}
                className={`transition-opacity ${benefitDragIndex === idx ? 'opacity-40' : 'opacity-100'}`}
              >
                <Card className="flex items-center gap-3 py-3">
                  <GripVertical className="h-4 w-4 cursor-grab text-ink-600 active:cursor-grabbing" />
                  <span className="text-xs font-mono text-ink-500">#{b.displayOrder}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{b.textEn}</p>
                    <p className="text-xs text-ink-400">{b.textEs}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => moveBenefit(idx, 'up')} disabled={idx === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moveBenefit(idx, 'down')} disabled={idx === benefits.length - 1}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEditBenefit(b)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteBenefit(b.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Card>
              </div>
            ))}
            {benefits.length === 0 && (
              <p className="text-sm text-ink-500">No benefits yet. Create one to start building the comparison matrix.</p>
            )}
          </div>

          {/* Matrix editor */}
          {levels.length > 0 && benefits.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <Check className="h-4 w-4 text-success-400" />
                <span className="text-sm font-medium text-ink-400">Benefit × Level Matrix — check which levels include each benefit</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-ink-400">Benefit</th>
                      {levels.map((l) => {
                        const Icon = ICON_MAP[l.icon] || Award;
                        return (
                          <th key={l.id} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`h-2.5 w-2.5 rounded-full ${COLOR_DOT[l.color] || 'bg-primary-500'}`} />
                              <Icon className="h-4 w-4 text-primary-400" />
                              <span className="text-xs font-medium text-white">{l.nameEn}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {benefits.map((b) => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <p className="text-sm text-white">{b.textEn}</p>
                          <p className="text-xs text-ink-400">{b.textEs}</p>
                        </td>
                        {levels.map((l) => (
                          <td key={l.id} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isCellIncluded(b.id, l.id)}
                              onChange={(e) => handleCellToggle(b.id, l.id, e.target.checked)}
                              className="h-4 w-4 cursor-pointer rounded border-white/20 accent-primary-500"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Level modal */}
          <Modal open={levelModalOpen} onClose={() => setLevelModalOpen(false)} title={editingLevel ? 'Edit Sponsorship Level' : 'New Sponsorship Level'}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Name (EN)" value={levelForm.nameEn} onChange={(v) => setLevelForm({ ...levelForm, nameEn: v })} placeholder="Bronze" />
                <Input label="Name (ES)" value={levelForm.nameEs} onChange={(v) => setLevelForm({ ...levelForm, nameEs: v })} placeholder="Bronce" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Textarea label="Description (EN)" value={levelForm.descriptionEn} onChange={(v) => setLevelForm({ ...levelForm, descriptionEn: v })} rows={2} placeholder="Foundation support..." />
                <Textarea label="Description (ES)" value={levelForm.descriptionEs} onChange={(v) => setLevelForm({ ...levelForm, descriptionEs: v })} rows={2} placeholder="Apoyo fundamental..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Min Amount ($)" type="number" value={levelForm.minAmount} onChange={(v) => setLevelForm({ ...levelForm, minAmount: v })} placeholder="100" />
                <Input label="Max Amount ($ — blank = no limit)" type="number" value={levelForm.maxAmount} onChange={(v) => setLevelForm({ ...levelForm, maxAmount: v })} placeholder="499" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Button Text (EN)" value={levelForm.buttonTextEn} onChange={(v) => setLevelForm({ ...levelForm, buttonTextEn: v })} placeholder="Donate" />
                <Input label="Button Text (ES)" value={levelForm.buttonTextEs} onChange={(v) => setLevelForm({ ...levelForm, buttonTextEs: v })} placeholder="Donar" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Icon" value={levelForm.icon} onChange={(v) => setLevelForm({ ...levelForm, icon: v })} options={SPONSOR_ICONS} />
                <Select label="Color" value={levelForm.color} onChange={(v) => setLevelForm({ ...levelForm, color: v })} options={SPONSOR_COLORS} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Button Action" value={levelForm.buttonAction} onChange={(v) => setLevelForm({ ...levelForm, buttonAction: v })} options={[
                  { value: 'both', label: 'Stripe + PayPal' },
                  { value: 'stripe', label: 'Stripe only' },
                  { value: 'paypal', label: 'PayPal only' },
                  { value: 'contact', label: 'Contact (no payment link)' },
                ]} />
                <Select label="Status" value={levelForm.status} onChange={(v) => setLevelForm({ ...levelForm, status: v })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Display Order" type="number" value={levelForm.displayOrder} onChange={(v) => setLevelForm({ ...levelForm, displayOrder: v })} placeholder="0" />
                <label className="flex items-end gap-2 pb-2">
                  <input
                    type="checkbox"
                    checked={levelForm.featured}
                    onChange={(e) => setLevelForm({ ...levelForm, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 accent-primary-500"
                  />
                  <span className="text-xs font-medium text-ink-400">Featured (highlight on public page)</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                <Button variant="ghost" onClick={() => setLevelModalOpen(false)}>Cancel</Button>
                <Button onClick={handleLevelSubmit} disabled={levelSaving}>{levelSaving ? 'Saving…' : 'Save Level'}</Button>
              </div>
            </div>
          </Modal>

          {/* Benefit modal */}
          <Modal open={benefitModalOpen} onClose={() => setBenefitModalOpen(false)} title={editingBenefit ? 'Edit Benefit' : 'New Benefit'}>
            <div className="flex flex-col gap-4">
              <Input label="Text (EN)" value={benefitForm.textEn} onChange={(v) => setBenefitForm({ ...benefitForm, textEn: v })} placeholder="Recognition on our website" />
              <Input label="Text (ES)" value={benefitForm.textEs} onChange={(v) => setBenefitForm({ ...benefitForm, textEs: v })} placeholder="Reconocimiento en nuestro sitio web" />
              <Input label="Display Order" type="number" value={benefitForm.displayOrder} onChange={(v) => setBenefitForm({ ...benefitForm, displayOrder: v })} placeholder="0" />
              <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                <Button variant="ghost" onClick={() => setBenefitModalOpen(false)}>Cancel</Button>
                <Button onClick={handleBenefitSubmit} disabled={benefitSaving}>{benefitSaving ? 'Saving…' : 'Save Benefit'}</Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
