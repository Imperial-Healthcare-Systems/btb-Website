'use client';

import { useEffect, useRef, useState, useCallback, FormEvent } from 'react';

type Remaining = { d: string; h: string; m: string; s: string };
const ZERO: Remaining = { d: '00', h: '00', m: '00', s: '00' };
const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

function remaining(launchMs: number): Remaining {
  const diff = launchMs - Date.now();
  if (diff <= 0) return ZERO;
  return {
    d: pad(Math.floor(diff / 86_400_000)),
    h: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
    m: pad(Math.floor((diff % 3_600_000) / 60_000)),
    s: pad(Math.floor((diff % 60_000) / 1000))
  };
}

const EMBER_TONES = [
  '232,180,165',
  '201,138,120',
  '228,195,129',
  '214,158,140',
  '244,205,190'
];

type Ember = {
  x: number; y: number; r: number;
  vy: number; drift: number;
  sway: number; sways: number; swayAmp: number;
  baseA: number;
  tw: number; tws: number;
  c: string;
  srcY: number;
};

function useEmbers(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let embers: Ember[] = [];
    let rafId = 0;

    const spawn = (seed: boolean): Ember => {
      const useBox = Math.random() < 0.45;
      const srcX = useBox ? 0.75 * w : 0.42 * w;
      const srcY = useBox ? 0.28 * h : 0.37 * h;
      const spread = useBox ? w * 0.13 : w * 0.15;
      const gx = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const x = srcX + gx * spread;
      const y = seed
        ? srcY - Math.random() * srcY
        : srcY + Math.random() * 0.05 * h;
      return {
        x, y,
        r: (Math.random() * 1.7 + 0.5) * dpr,
        vy: -(Math.random() * 0.11 + 0.045) * dpr,
        drift: (Math.random() - 0.5) * 0.12 * dpr,
        sway: Math.random() * Math.PI * 2,
        sways: Math.random() * 0.007 + 0.003,
        swayAmp: (Math.random() * 0.45 + 0.16) * dpr,
        baseA: Math.random() * 0.55 + 0.25,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.015 + 0.006,
        c: EMBER_TONES[(Math.random() * EMBER_TONES.length) | 0],
        srcY
      };
    };

    const build = () => {
      const count = Math.round((cv.clientWidth * cv.clientHeight) / 4960);
      embers = [];
      for (let i = 0; i < count; i++) embers.push(spawn(true));
    };

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      w = cv.width = Math.max(1, r.width * dpr);
      h = cv.height = Math.max(1, r.height * dpr);
      cv.style.width = r.width + 'px';
      cv.style.height = r.height + 'px';
      build();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.sway += p.sways;
        p.tw += p.tws;
        p.y += p.vy;
        p.x += p.drift + Math.sin(p.sway) * p.swayAmp;
        const topFade = p.y < h * 0.1 ? Math.max(0, p.y / (h * 0.1)) : 1;
        const bornFade = p.y > p.srcY
          ? Math.max(0, (p.srcY + h * 0.04 - p.y) / (h * 0.04))
          : 1;
        const flicker = 0.55 + 0.45 * Math.sin(p.tw);
        const a = p.baseA * topFade * bornFade * (0.5 + 0.5 * flicker);
        if (p.y < -10 || (a <= 0.001 && p.y > p.srcY)) {
          embers[i] = spawn(false);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`;
        ctx.shadowBlur = 9 * dpr;
        ctx.shadowColor = `rgba(214,130,110,${(a * 0.85).toFixed(3)})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    };

    size();
    window.addEventListener('resize', size);
    frame();

    return () => {
      window.removeEventListener('resize', size);
      cancelAnimationFrame(rafId);
    };
  }, [canvasRef]);
}

export default function ComingSoon({ launchIso }: { launchIso: string }) {
  const launchMs = Date.parse(launchIso);
  const [time, setTime] = useState<Remaining>(ZERO);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('Join the exclusive waitlist for first access');
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEmbers(canvasRef);

  useEffect(() => {
    setTime(remaining(launchMs));
    const id = setInterval(() => setTime(remaining(launchMs)), 1000);
    return () => clearInterval(id);
  }, [launchMs]);

  const submit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (pending) return;
      const v = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        setOk(false);
        setNote('Please enter a valid email');
        return;
      }
      setPending(true);
      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: v })
        });
        if (!res.ok) throw new Error(String(res.status));
        setOk(true);
        setNote('Welcome to the waitlist — you’re first in line');
        setEmail('');
      } catch {
        setOk(false);
        setNote('Something went wrong. Please try again.');
      } finally {
        setPending(false);
      }
    },
    [email, pending]
  );

  return (
    <div className="stage">
      <div className="hero">
        <div className="hero__img" />
        <canvas id="embers" ref={canvasRef} />
      </div>

      <div className="panel">
        <div className="frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="corner tl" src="/corner.svg" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="corner br" src="/corner.svg" alt="" />
        </div>

        <div className="eyebrow">
          <span className="dash" />
          Coming Soon
          <span className="dash r" />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="logo" src="/logo.png" alt="Beyond the Body" />

        <h1>The Art of <em>Attraction</em></h1>

        <div className="orn">
          <span className="l" />
          <span className="dot">✦</span>
          <span className="l r" />
        </div>

        <p className="sub">
          For those who command attention without seeking it, and leave an impression long after they’ve departed.
        </p>

        <div className="countdown" aria-label="Countdown to launch">
          <div className="unit"><span className="num">{time.d}</span><span className="lab">Days</span></div>
          <div className="unit"><span className="num">{time.h}</span><span className="lab">Hours</span></div>
          <div className="unit"><span className="num">{time.m}</span><span className="lab">Minutes</span></div>
          <div className="unit"><span className="num">{time.s}</span><span className="lab">Seconds</span></div>
        </div>

        <form className="signup" onSubmit={submit} noValidate>
          <div className="field">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              autoComplete="email"
              required
            />
            <button type="submit" disabled={pending}>
              {pending ? 'Sending…' : 'Join the Waitlist'}
            </button>
          </div>
          <div className={`note${ok ? ' ok' : ''}`}>{note}</div>
        </form>

        <div className="meta">
          <span>Beyond the Body™</span>
        </div>
      </div>
    </div>
  );
}
