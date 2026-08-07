import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles, RotateCcw, Camera, Cpu, Truck, Wand2, Trophy, Volume2, VolumeX, Share2, PartyPopper,
} from 'lucide-react';
import { Section, Reveal } from '@/components/Section';
import { useLang, getTranslation } from '@/i18n/LanguageContext';

const SEG_ICONS = [Camera, Wand2, Truck, Cpu, Trophy, Camera];
const SEG_COLORS = ['#e5484d', '#f08c00', '#2f9e44', '#1c7ed6', '#9c36b5', '#be4bdb'];
const SEG_COUNT = 6;
const SEG_ANGLE = 360 / SEG_COUNT;
const SPIN_MS = 5400;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${cx} ${cy} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function useTickSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const tick = useCallback(() => {
    if (!enabled) return;
    try {
      if (!ctxRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 1100;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      /* audio not available */
    }
  }, [enabled]);

  const winFanfare = useCallback(() => {
    if (!enabled) return;
    try {
      if (!ctxRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t0 = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.4);
      });
    } catch {
      /* audio not available */
    }
  }, [enabled]);

  return { tick, winFanfare };
}

type Confetto = { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; vrot: number };

function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<Confetto[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (fire === 0) return;
    const colors = ['#e5484d', '#f08c00', '#2f9e44', '#1c7ed6', '#9c36b5', '#be4bdb'];
    const next: Confetto[] = Array.from({ length: 80 }, () => ({
      x: 50 + (Math.random() - 0.5) * 30,
      y: 50,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(Math.random() * 1.5 + 0.5),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
    }));
    setPieces(next);
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      if (elapsed > 3) {
        setPieces([]);
        return;
      }
      setPieces((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy + elapsed * 18,
            rot: p.rot + p.vrot,
          }))
          .filter((p) => p.y < 120)
      );
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fire]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            background: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rot}deg)`,
            opacity: Math.max(0, 1 - (performance.now() - startRef.current) / 3000),
          }}
        />
      ))}
    </div>
  );
}

export function Roulette() {
  const { lang } = useLang();
  const t = getTranslation(lang);
  const segments = t.roulette.segments;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [spins, setSpins] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [confettiFire, setConfettiFire] = useState(0);
  const lastSegRef = useRef(-1);
  const rafRef = useRef<number>(0);

  const { tick, winFanfare } = useTickSound(soundOn);

  useEffect(() => {
    if (!spinning) return;
    const startRot = rotation - 360 * 6;
    const startTime = performance.now();
    const duration = SPIN_MS;

    const step = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const currentRot = startRot + (rotation - startRot) * eased;
      const seg = Math.floor((((currentRot % 360) + 360) % 360) / SEG_ANGLE);
      if (seg !== lastSegRef.current) {
        lastSegRef.current = seg;
        tick();
      }
      if (p < 1 && spinning) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, rotation, tick]);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    lastSegRef.current = -1;

    const targetIndex = Math.floor(Math.random() * SEG_COUNT);
    const baseRotation = 360 * (6 + spins);
    const landingRotation = baseRotation + (360 - (targetIndex * SEG_ANGLE + SEG_ANGLE / 2));

    setRotation(landingRotation);
    setSpins((s) => s + 1);

    window.setTimeout(() => {
      setWinner(targetIndex);
      setSpinning(false);
      winFanfare();
      setConfettiFire((f) => f + 1);
    }, SPIN_MS);
  }, [spinning, spins, winFanfare]);

  return (
    <Section id="ruleta" className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-dream-gradient-soft blur-3xl" />

      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="eyebrow text-dream-purple">
            <Sparkles className="h-4 w-4" /> {t.roulette.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
            {t.roulette.title1} <span className="text-gradient-dream">{t.roulette.title2}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
            {t.roulette.lead}
          </p>

          <div className="mt-7 space-y-3.5">
            {t.roulette.features.map((item, idx) => {
              const Icon = [Wand2, Camera, Trophy][idx] ?? Wand2;
              return (
                <div key={item.title} className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/60">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/60">
              <RotateCcw className="h-3.5 w-3.5" />
              {spins} {spins === 1 ? t.roulette.spin : t.roulette.spins}
            </div>
            <button
              type="button"
              onClick={() => setSoundOn((s) => !s)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={soundOn ? t.roulette.mute : t.roulette.unmute}
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {soundOn ? t.roulette.soundOn : t.roulette.soundOff}
            </button>
          </div>
        </Reveal>

        <Reveal delay={2} className="flex flex-col items-center">
          <div className="relative">
            <Confetti fire={confettiFire} />

            <div className="absolute left-1/2 top-[-10px] z-20 -translate-x-1/2">
              <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
            </div>

            <div className="relative flex h-72 w-72 items-center justify-center rounded-full border-8 border-white/10 bg-ink-900 shadow-glow-dream sm:h-80 sm:w-80 md:h-96 md:w-96">
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * 360;
                const pos = polar(50, 50, 49, angle);
                return (
                  <span
                    key={i}
                    className={`absolute h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-dream-orange' : 'bg-white/40'} ${spinning ? 'animate-pulse' : ''}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transitionDelay: `${i * 30}ms` }}
                  />
                );
              })}

              <svg
                viewBox="0 0 200 200"
                className="h-full w-full transition-transform ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: `${SPIN_MS}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                }}
              >
                <defs>
                  {SEG_COLORS.map((color, i) => (
                    <radialGradient key={i} id={`grad-${i}`} cx="50%" cy="50%" r="80%">
                      <stop offset="0%" stopColor={color} stopOpacity="1" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.75" />
                    </radialGradient>
                  ))}
                </defs>

                {segments.map((seg, i) => {
                  const start = i * SEG_ANGLE;
                  const end = start + SEG_ANGLE;
                  const mid = start + SEG_ANGLE / 2;
                  const iconPos = polar(100, 100, 58, mid);
                  const labelPos = polar(100, 100, 80, mid);
                  const isWinner = winner === i && !spinning;
                  const Icon = SEG_ICONS[i];
                  return (
                    <g key={i}>
                      <path
                        d={arcPath(100, 100, 100, start, end)}
                        fill={`url(#grad-${i})`}
                        stroke={isWinner ? '#ffffff' : 'rgba(8,11,22,0.6)'}
                        strokeWidth={isWinner ? '2' : '0.6'}
                        style={isWinner ? { filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' } : undefined}
                      />
                      <g transform={`translate(${iconPos.x}, ${iconPos.y}) rotate(${mid})`}>
                        <foreignObject x="-11" y="-11" width="22" height="22">
                          <div className="flex h-[22px] w-[22px] items-center justify-center">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </foreignObject>
                      </g>
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        className="font-bold uppercase"
                        style={{ fontSize: '7px', transform: `rotate(${mid}deg)`, transformOrigin: `${labelPos.x}px ${labelPos.y}px` }}
                      >
                        {seg.short}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="group absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-dream-gradient bg-[length:200%_200%] shadow-lg ring-4 ring-ink-900 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-80 sm:h-24 sm:w-24"
                aria-label="Spin the Dream Wheel"
              >
                <span className="flex flex-col items-center gap-0.5 text-white">
                  <RotateCcw className={`h-6 w-6 ${spinning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{spinning ? t.roulette.spinning : t.roulette.spinBtn}</span>
                </span>
              </button>
            </div>

            <div className="pointer-events-none absolute -right-3 -top-3 h-6 w-6 animate-float text-dream-purple/70">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="pointer-events-none absolute -left-4 bottom-6 h-5 w-5 animate-float-slow text-dream-orange/70">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-8 w-full max-w-sm">
            {winner !== null ? (
              <div className="animate-scale-in flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 px-6 py-5 text-center backdrop-blur">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-dream-orange">
                  <PartyPopper className="h-4 w-4" /> {t.roulette.winLabel}
                </span>
                <span className="font-display text-2xl font-extrabold text-white">{segments[winner].label}</span>
                <span className="text-xs text-white/50">{t.roulette.winSub}</span>
                <div className="mt-1 flex items-center gap-2">
                  <a href="#donacion" className="btn-dream !px-5 !py-2.5 !text-xs">
                    {t.roulette.supportCta}
                  </a>
                  <button
                    type="button"
                    onClick={() => setWinner(null)}
                    className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Share2 className="mr-1 inline h-3.5 w-3.5" /> {t.roulette.spinAgain}
                  </button>
                </div>
              </div>
            ) : (
              <p className="flex h-24 items-center justify-center text-center text-sm text-white/40">
                {spinning ? t.roulette.spinningMsg : t.roulette.idleMsg}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
