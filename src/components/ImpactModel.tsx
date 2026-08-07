import { useEffect, useState } from 'react';
import { Wrench, Film, Truck, Handshake, Building2, Globe, Users } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useLang, getTranslation } from '@/i18n/LanguageContext';

const DIST_META = [
  { pct: 60, color: 'from-primary-500 to-primary-700', icon: Wrench, hex: '#1f6df2' },
  { pct: 25, color: 'from-accent-400 to-accent-600', icon: Film, hex: '#f08c00' },
  { pct: 15, color: 'from-dream-purple to-dream-blue', icon: Truck, hex: '#9c36b5' },
];

const SPONSOR_ICONS = [Building2, Handshake, Globe, Users];

type Logo = {
  id: string;
  title: string;
  blobUrl: string;
};

function Donut() {
  const { lang } = useLang();
  const t = getTranslation(lang);

  const radius = 70;
  const circ = 2 * Math.PI * radius;

  const segments = [
    { pct: 60, color: '#1f6df2', offset: 0 },
    { pct: 25, color: '#f08c00', offset: 60 },
    { pct: 15, color: '#9c36b5', offset: 85 },
  ];

  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#eceef2"
          strokeWidth="22"
        />

        {segments.map((s) => {
          const len = (s.pct / 100) * circ;
          const dashOffset = -(s.offset / 100) * circ;

          return (
            <circle
              key={s.color}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-extrabold text-ink-900">
          $6K–8K
        </span>

        <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
          {t.impact.perWork}
        </span>
      </div>
    </div>
  );
}

export function ImpactModel() {
  const { lang } = useLang();
  const t = getTranslation(lang);

  const [logos, setLogos] = useState<Logo[]>([]);


  // Cargar logos desde Media
  useEffect(() => {
    fetch('/api/media?category=logos')
      .then((res) => res.json())
      .then((data) => {
        const items = data.media || data || [];

        setLogos(
          items.filter(
            (item: Logo) => item.blobUrl
          )
        );
      })
      .catch(() => {
        setLogos([]);
      });
  }, []);


  return (
    <Section id="impacto" className="relative overflow-hidden bg-white">

      <div className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-primary-50 blur-3xl" />

      <Reveal className="max-w-3xl">

        <span className="eyebrow text-primary-700">
          <Handshake className="h-4 w-4" />
          {t.impact.eyebrow}
        </span>


        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
          {t.impact.title1}{' '}
          <span className="text-gradient-blue">
            {t.impact.title2}
          </span>{' '}
          {t.impact.titleSuffix}
        </h2>


        <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
          {t.impact.lead}
        </p>

      </Reveal>



      <div className="mt-12 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

        <Reveal className="flex justify-center">
          <Donut />
        </Reveal>


        <div className="space-y-4">

          {DIST_META.map((d, i) => (

            <Reveal key={i} delay={(i + 1) as 1 | 2 | 3}>

              <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-5">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${d.color} text-white shadow-md`}
                    >
                      <d.icon className="h-5 w-5" />
                    </span>


                    <div>
                      <p className="font-display text-base font-bold text-ink-900">
                        {t.impact.distribution[i].label}
                      </p>

                      <p className="text-xs text-ink-500">
                        {t.impact.distribution[i].detail}
                      </p>
                    </div>

                  </div>


                  <span className="font-display text-2xl font-extrabold text-ink-900">
                    {d.pct}%
                  </span>

                </div>


                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-200">

                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${d.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${d.pct}%` }}
                  />

                </div>

              </div>

            </Reveal>

          ))}

        </div>

      </div>



      <div className="mt-20 border-t border-ink-100 pt-14">

        <Reveal className="max-w-3xl">

          <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.impact.sponsorsTitle}
          </h3>

          <p className="mt-3 text-base leading-relaxed text-ink-600">
            {t.impact.sponsorsLead}
          </p>

        </Reveal>



        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {t.impact.sponsorTiers.map((tier, i) => (

            <Reveal key={tier.name} delay={(i + 1) as 1 | 2 | 3 | 4}>

              <div className="group h-full rounded-3xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card">

                <div className="flex items-center justify-between">

                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">

                    {(() => {
                      const Icon = SPONSOR_ICONS[i] ?? Building2;
                      return <Icon className="h-5 w-5" />;
                    })()}

                  </span>


                  <span className="font-display text-2xl font-extrabold text-gradient-blue">
                    {['40%', '30%', '15%', '15%'][i]}
                  </span>

                </div>


                <p className="mt-4 font-display text-base font-bold text-ink-900">
                  {tier.name}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  {tier.desc}
                </p>

              </div>

            </Reveal>

          ))}

        </div>



        {/* LOGOS DINÁMICOS DESDE MEDIA */}

        {logos.length > 0 && (

          <Reveal delay={2} className="mt-10">

            <div className="mask-fade-x overflow-hidden rounded-2xl border border-ink-100 bg-ink-50/60 py-5">

              <div className="flex w-max animate-marquee gap-12 px-6">

                {[...Array(2)].map((_, dup) => (

                  <div key={dup} className="flex gap-12">

                    {logos.map((logo) => (

                      <div
                        key={`${logo.id}-${dup}`}
                        className="flex h-14 w-36 items-center justify-center rounded-xl bg-white px-4"
                      >

                        <img
                          src={logo.blobUrl}
                          alt={logo.title}
                          className="max-h-10 max-w-full object-contain"
                        />

                      </div>

                    ))}

                  </div>

                ))}

              </div>

            </div>


            <p className="mt-3 text-center text-xs text-ink-400">
              {t.impact.logosNote}
            </p>

          </Reveal>

        )}

      </div>

    </Section>
  );
}