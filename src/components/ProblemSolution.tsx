import { Home, Wrench, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { IMAGES } from '@/data/content';
import { useLang, getTranslation } from '@/i18n/LanguageContext';
import { useMediaByCategory } from '@/hooks/useMedia';

export function ProblemSolution() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const problemMedia = useMediaByCategory('about');
  const solutionMedia = useMediaByCategory('programs');

  const problemImg = problemMedia[0]?.blobUrl || IMAGES.problemWorn;
  const solutionImg = solutionMedia[0]?.blobUrl || IMAGES.solutionPainting;

  return (
    <Section id="proyecto" className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Problem side */}
        <Reveal>
          <span className="eyebrow text-error-600">
            <AlertTriangle className="h-4 w-4" /> {t.problemSolution.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
            {t.problemSolution.title1} <span className="text-error-600">{t.problemSolution.title2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
            {t.problemSolution.lead}
          </p>

          <ul className="mt-7 space-y-3.5">
            {t.problemSolution.problems.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-2xl border border-error-100 bg-error-50/60 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-error-100 text-error-600">
                  <Home className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium leading-relaxed text-ink-700">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 shadow-card">
            <img
              src={problemImg}
              alt={t.problemSolution.altProblem}
              className="aspect-[16/10] w-full object-cover"
              loading="lazy"
            />
          </div>
        </Reveal>

        {/* Solution side */}
        <Reveal delay={2}>
          <span className="eyebrow text-success-600">
            <Wrench className="h-4 w-4" /> {t.problemSolution.eyebrowSolution}
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl text-balance">
            {t.problemSolution.titleSol1} <span className="text-gradient-blue">{t.problemSolution.titleSol2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-600 sm:text-lg">
            {t.problemSolution.leadSol}
          </p>

          <ul className="mt-7 space-y-3.5">
            {t.problemSolution.solutions.map((s) => (
              <li key={s} className="flex items-start gap-3 rounded-2xl border border-success-100 bg-success-50/60 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-100 text-success-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium leading-relaxed text-ink-700">{s}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 shadow-card">
            <img
              src={solutionImg}
              alt={t.problemSolution.altSolution}
              className="aspect-[16/10] w-full object-cover"
              loading="lazy"
            />
          </div>

          <a href="#ruleta" className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800">
            {t.problemSolution.linkRoulette}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </Section>
  );
}
