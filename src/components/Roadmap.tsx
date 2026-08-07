import { Rocket, Network, Globe2, MapPin, TrendingUp, Check } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useLang, getTranslation } from '@/i18n/LanguageContext';

const PHASE_META = [
  { icon: Rocket, color: 'from-dream-red to-dream-orange', status: 'active' },
  { icon: Network, color: 'from-primary-500 to-primary-700', status: 'upcoming' },
  { icon: Globe2, color: 'from-dream-purple to-dream-blue', status: 'upcoming' },
];

export function Roadmap() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  return (
    <Section id="roadmap" className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-dream-purple/20 blur-3xl" />

      <Reveal className="max-w-3xl">
        <span className="eyebrow text-dream-orange">
          <TrendingUp className="h-4 w-4" /> {t.roadmap.eyebrow}
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
          {t.roadmap.title1} <span className="text-gradient-dream">{t.roadmap.title2}</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
          {t.roadmap.lead}
        </p>
      </Reveal>

      <div className="relative mt-14">
        <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-dream-red via-primary-500 to-dream-purple md:left-0 md:top-1/2 md:h-px md:w-full md:bg-gradient-to-r" />

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {t.roadmap.phases.map((phase, i) => {
            const meta = PHASE_META[i];
            const Icon = meta.icon;
            return (
              <Reveal key={phase.phase} delay={(i + 1) as 1 | 2 | 3} className="relative pl-16 md:pl-0 md:pt-0">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 ring-4 ring-ink-950 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
                  <span className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                </div>

                <div
                  className={`rounded-3xl border p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 ${
                    meta.status === 'active'
                      ? 'border-dream-orange/40 bg-dream-orange/10 shadow-glow-dream'
                      : 'border-white/10 bg-white/5'
                  } ${i === 1 ? 'md:mt-16' : ''} ${i === 2 ? 'md:mt-32' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">{phase.phase}</span>
                    {meta.status === 'active' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-dream-orange/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-dream-orange">
                        <span className="h-1.5 w-1.5 rounded-full bg-dream-orange" /> {t.roadmap.active}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-extrabold text-white">{phase.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/50">
                    <MapPin className="h-3.5 w-3.5" /> {phase.period}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{phase.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {phase.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-dream-green" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
