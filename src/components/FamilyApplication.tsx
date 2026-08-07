import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import {
  Users, Camera, PenLine, ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle,
  Upload, X, FileVideo, ImageIcon, Home, Phone, Mail, MapPin, Check,
} from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { uploadFamilyMedia } from '@/lib/storage';
import { useLang, getTranslation } from '@/i18n/LanguageContext';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

type Status = 'idle' | 'loading' | 'success' | 'error';
type Uploaded = { name: string; url: string; type: string };

export function FamilyApplication() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const steps = t.familyApp.steps;
  const spacesList = t.familyApp.spaces;

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<Uploaded[]>([]);

  const [form, setForm] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    family_name: '',
    address: '',
    city: '',
    state: '',
    spaces: [] as string[],
    story: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const set = (key: keyof typeof form, value: string | string[]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSpace = (space: string) =>
    setForm((f) => ({
      ...f,
      spaces: f.spaces.includes(space)
        ? f.spaces.filter((s) => s !== space)
        : [...f.spaces, space],
    }));

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setUploading(true);
    const uploaded: Uploaded[] = [];
    for (const file of selected) {
      const url = await uploadFamilyMedia(file);
      if (url) uploaded.push({ name: file.name, url, type: file.type });
    }
    setFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.applicant_name.trim() || !form.applicant_email.trim() || !form.family_name.trim()) {
        setErrorMsg(t.familyApp.errStep1);
        return false;
      }
    }
    if (step === 3 && !form.story.trim()) {
      setErrorMsg(t.familyApp.errStory);
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(3, s + 1));
  };
  const back = () => {
    setErrorMsg('');
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setStatus('loading');
    setErrorMsg('');

    const details = [
      `Familia: ${form.family_name.trim()}`,
      `Solicitante: ${form.applicant_name.trim()}`,
      `Email: ${form.applicant_email.trim()}`,
      form.applicant_phone.trim() && `Teléfono: ${form.applicant_phone.trim()}`,
      form.address.trim() && `Dirección: ${form.address.trim()}`,
      form.city.trim() && `Ciudad: ${form.city.trim()}`,
      form.state.trim() && `Estado: ${form.state.trim()}`,
      `Espacios: ${form.spaces.join(', ')}`,
      files.length > 0 && `Archivos: ${files.map((f) => f.name).join(', ')}`,
      ``,
      form.story.trim(),
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch(`${API_BASE}/forms?action=contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.applicant_name.trim(),
          email: form.applicant_email.trim(),
          subject: `Postulación familiar — ${form.family_name.trim()}`,
          message: details,
        }),
      });

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(t.familyApp.errGeneric);
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t.familyApp.errGeneric);
    }
  };

  const progress = (step / 3) * 100;

  if (status === 'success') {
    return (
      <Section id="postulacion" className="bg-ink-50">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckCircle2 className="h-10 w-10" />
          </span>
          <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t.familyApp.successTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            {t.familyApp.successMsg}
            <strong className="text-ink-900"> {form.family_name || (lang === 'es' ? 'tu familia' : 'your family')}</strong>.{' '}
            {t.familyApp.successMsg2}
          </p>
          <a href="#top" className="btn-primary mt-8">{t.familyApp.backHome}</a>
        </Reveal>
      </Section>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

  return (
    <Section id="postulacion" className="relative overflow-hidden bg-ink-50">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-dream-green/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-primary-600/10 blur-3xl" />

      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="eyebrow text-dream-green justify-center">
          <Home className="h-4 w-4" /> {t.familyApp.eyebrow}
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
          {t.familyApp.title1} <span className="text-gradient-dream">{t.familyApp.title2}</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
          {t.familyApp.lead}
        </p>
      </Reveal>

      <Reveal delay={1} className="mx-auto mt-12 max-w-2xl">
        <div className="card-surface p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((sLabel, i) => {
                const sId = i + 1;
                const Icon = [Users, Camera, PenLine][i] ?? Users;
                const done = step > sId;
                const active = step === sId;
                return (
                  <div key={sLabel} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                          done
                            ? 'border-success-500 bg-success-500 text-white'
                            : active
                            ? 'border-primary-600 bg-primary-600 text-white shadow-glow-blue'
                            : 'border-ink-200 bg-white text-ink-400'
                        }`}
                      >
                        {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className={`text-xs font-semibold ${active || done ? 'text-ink-900' : 'text-ink-400'}`}>
                        {sLabel}
                      </span>
                    </div>
                    {sId < 3 && (
                      <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-ink-200">
                        <div
                          className="h-full rounded-full bg-success-500 transition-all duration-500"
                          style={{ width: done ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-dream-gradient transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={submit} noValidate>
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t.familyApp.fields.fullName} icon={Users}>
                    <input type="text" value={form.applicant_name} onChange={(e) => set('applicant_name', e.target.value)} placeholder={t.familyApp.fields.fullNamePh} className={inputClass} />
                  </Field>
                  <Field label={t.familyApp.fields.familyName} icon={Home}>
                    <input type="text" value={form.family_name} onChange={(e) => set('family_name', e.target.value)} placeholder={t.familyApp.fields.familyNamePh} className={inputClass} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t.familyApp.fields.email} icon={Mail}>
                    <input type="email" value={form.applicant_email} onChange={(e) => set('applicant_email', e.target.value)} placeholder="tu@email.com" className={inputClass} />
                  </Field>
                  <Field label={t.familyApp.fields.phone} icon={Phone}>
                    <input type="tel" value={form.applicant_phone} onChange={(e) => set('applicant_phone', e.target.value)} placeholder="(000) 000-0000" className={inputClass} />
                  </Field>
                </div>
                <Field label={t.familyApp.fields.address} icon={MapPin}>
                  <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder={t.familyApp.fields.addressPh} className={inputClass} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t.familyApp.fields.city}>
                    <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Houston" className={inputClass} />
                  </Field>
                  <Field label={t.familyApp.fields.state}>
                    <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="Texas" className={inputClass} />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-ink-800">
                    {t.familyApp.spacesLabel}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {spacesList.map((space) => {
                      const active = form.spaces.includes(space);
                      return (
                        <button
                          key={space}
                          type="button"
                          onClick={() => toggleSpace(space)}
                          className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all ${
                            active
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-ink-200 bg-white text-ink-600 hover:border-primary-300'
                          }`}
                        >
                          {active && <Check className="mr-1 inline h-3.5 w-3.5" />}
                          {space}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-ink-800">
                    {t.familyApp.uploadLabel}
                  </label>
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50/60 px-6 py-10 text-center transition-all hover:border-primary-400 hover:bg-primary-50/40"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                    </span>
                    <span className="mt-3 text-sm font-semibold text-ink-800">
                      {uploading ? t.familyApp.uploading : t.familyApp.uploadCta}
                    </span>
                    <span className="mt-1 text-xs text-ink-400">{t.familyApp.uploadHint}</span>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={onFiles}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <ul className="space-y-2.5">
                    {files.map((file, idx) => {
                      const isVideo = file.type.startsWith('video');
                      return (
                        <li key={file.url} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                            {isVideo ? <FileVideo className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink-800">{file.name}</p>
                            <p className="text-xs text-ink-400">{isVideo ? t.familyApp.video : t.familyApp.image} {t.familyApp.uploaded}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-error-50 hover:text-error-600"
                            aria-label={t.familyApp.removeFile}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label htmlFor="story" className="mb-2 block text-sm font-semibold text-ink-800">
                    {t.familyApp.storyLabel}
                  </label>
                  <p className="mb-3 text-sm text-ink-500">
                    {t.familyApp.storyHelp}
                  </p>
                  <textarea
                    id="story"
                    value={form.story}
                    onChange={(e) => set('story', e.target.value)}
                    rows={8}
                    placeholder={t.familyApp.storyPh}
                    className="w-full resize-none rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm leading-relaxed text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4">
                  <p className="flex items-start gap-2 text-sm text-ink-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                    {t.familyApp.consent}
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="mt-5 flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                disabled={step === 1}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-600 transition-all hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> {t.familyApp.back}
              </button>

              {step < 3 ? (
                <button type="button" onClick={next} className="btn-primary">
                  {t.familyApp.continue} <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="submit" disabled={status === 'loading'} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
                  {status === 'loading' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t.familyApp.sending}</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> {t.familyApp.submit}</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </Reveal>
    </Section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-800">{label}</label>
      {Icon ? (
        <div className="relative">
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <div className="[&>input]:pl-10">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
