import { useEffect, useState } from 'react';
import { Pencil, Package, ExternalLink, Copy, Check, Zap, GripVertical, Award } from 'lucide-react';
import { Card, PageHeader, Badge, Button, Modal, Input, Textarea, Select } from '@/admin/components/ui';
import { getPlans, updatePlan } from '@/admin/services/db';
import { formatCurrency, formatDate } from '@/admin/utils/format';
import type { Plan } from '@/admin/services/db';

const STRIPE_DASHBOARD = 'https://dashboard.stripe.com';

const ICON_OPTIONS = [
  { value: 'Heart', label: 'Heart' },
  { value: 'Sparkles', label: 'Sparkles' },
  { value: 'Award', label: 'Award' },
  { value: 'Crown', label: 'Crown' },
  { value: 'Star', label: 'Star' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Gift', label: 'Gift' },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Azul' },
  { value: 'purple', label: 'Púrpura' },
  { value: 'gold', label: 'Dorado' },
  { value: 'orange', label: 'Naranja' },
  { value: 'green', label: 'Verde' },
  { value: 'accent', label: 'Acento' },
];

type FormState = {
  name: string;
  description: string;
  tagline: string;
  price: string;
  currency: string;
  billingInterval: string;
  stripePriceId: string;
  benefits: string;
  icon: string;
  color: string;
  sortOrder: string;
  active: boolean;
};

function planToForm(p: Plan): FormState {
  return {
    name: p.name,
    description: p.description || '',
    tagline: p.tagline || '',
    price: String(p.price),
    currency: p.currency,
    billingInterval: p.billingInterval || 'monthly',
    stripePriceId: p.stripePriceId || '',
    benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : '',
    icon: p.icon || 'Heart',
    color: p.color || 'blue',
    sortOrder: String(p.sortOrder),
    active: p.active,
  };
}

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', description: '', tagline: '', price: '', currency: 'USD', billingInterval: 'monthly', stripePriceId: '', benefits: '', icon: 'Heart', color: 'blue', sortOrder: '0', active: true });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => { getPlans().then(setPlans); };
  useEffect(() => { load(); }, []);

  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm(planToForm(p));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const benefitsList = form.benefits.split('\n').map((b) => b.trim()).filter(Boolean);
      await updatePlan(editing.id, {
        name: form.name,
        description: form.description || null,
        tagline: form.tagline || null,
        price: Number(form.price),
        currency: form.currency,
        billingInterval: form.billingInterval,
        stripePriceId: form.stripePriceId || null,
        benefits: benefitsList,
        icon: form.icon,
        color: form.color,
        sortOrder: Number(form.sortOrder),
        active: form.active,
      });
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Plan) => {
    await updatePlan(p.id, { active: !p.active });
    load();
  };

  const copyPriceId = (priceId: string) => {
    navigator.clipboard.writeText(priceId);
    setCopiedId(priceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Planes"
        description="Gestión de membresías — Dreamer Friend, Transformation Sponsor, Strategic Ally"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const priceId = p.stripePriceId || '';
          const hasPriceId = Boolean(priceId);
          return (
            <Card key={p.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-ink-600" />
                  <span className="text-xs font-mono text-ink-500">#{p.sortOrder}</span>
                  <Package className="h-5 w-5 text-primary-400" />
                  <h3 className="text-base font-semibold text-white">{p.name}</h3>
                </div>
                <Badge variant={p.active ? 'success' : 'default'}>{p.active ? 'Activo' : 'Inactivo'}</Badge>
              </div>

              {p.tagline && <p className="text-sm font-medium text-primary-300">{p.tagline}</p>}
              {p.description && <p className="text-sm text-ink-400">{p.description}</p>}

              <div>
                <p className="text-2xl font-bold text-white">{formatCurrency(Number(p.price), p.currency)}<span className="text-sm font-normal text-ink-500">/mes</span></p>
                <p className="text-xs text-ink-500">Actualizado {formatDate(p.updatedAt)}</p>
              </div>

              {Array.isArray(p.benefits) && p.benefits.length > 0 && (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-xs font-medium text-ink-400">Beneficios</span>
                  <ul className="mt-1.5 space-y-1">
                    {p.benefits.map((b, i) => (
                      <li key={i} className="text-xs text-ink-300 flex items-start gap-1.5">
                        <Check className="h-3 w-3 mt-0.5 text-success-400 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
                    <Zap className="h-3.5 w-3.5 text-accent-400" /> Stripe Price ID
                  </span>
                  <Badge variant={hasPriceId ? 'info' : 'warning'}>
                    {hasPriceId ? 'Configurado' : 'Pendiente'}
                  </Badge>
                </div>
                {hasPriceId ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded bg-black/30 px-2 py-1 text-xs text-ink-300">{priceId}</code>
                    <button
                      onClick={() => copyPriceId(priceId)}
                      className="shrink-0 rounded p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-white"
                      title="Copiar Price ID"
                    >
                      {copiedId === priceId ? <Check className="h-3.5 w-3.5 text-success-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={`${STRIPE_DASHBOARD}/prices/${priceId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-white"
                      title="Abrir en Stripe"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-ink-500">Sin Price ID configurado</p>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                <Button size="sm" variant="secondary" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /> Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(p)}>{p.active ? 'Desactivar' : 'Activar'}</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar plan">
        {editing && (
          <div className="flex flex-col gap-4">
            <Input label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Dreamer Friend" />
            <Input label="Eslogan / Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} placeholder="The first step to transform lives" />
            <Textarea label="Descripción" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Descripción del plan" rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Precio mensual" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="20.00" />
              <Select label="Moneda" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'MXN', label: 'MXN' }]} />
            </div>
            <Select label="Periodicidad" value={form.billingInterval} onChange={(v) => setForm({ ...form, billingInterval: v })} options={[{ value: 'monthly', label: 'Mensual' }, { value: 'annual', label: 'Anual' }]} />
            <Input label="Stripe Price ID" value={form.stripePriceId} onChange={(v) => setForm({ ...form, stripePriceId: v })} placeholder="price_..." />
            <Textarea label="Beneficios (uno por línea)" value={form.benefits} onChange={(v) => setForm({ ...form, benefits: v })} placeholder={"Reconocimiento en nuestra comunidad digital\nAcceso a reportes mensuales de impacto"} rows={5} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Icono" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} options={ICON_OPTIONS} />
              <Select label="Color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={COLOR_OPTIONS} />
            </div>
            <Input label="Orden de aparición" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} placeholder="1" />
            <label className="flex items-center gap-2 text-sm text-ink-300">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-white/5" />
              Plan activo
            </label>
            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
