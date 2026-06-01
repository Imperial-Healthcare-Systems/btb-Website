'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { LOGO_DATA_URL } from './logo';

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

export default function ComingSoon({ launchIso }: { launchIso: string }) {
  const launchMs = Date.parse(launchIso);
  const [time, setTime] = useState<Remaining>(ZERO);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('Be the first to know. Join the list for early access.');
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

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
        setNote('Please enter a valid email address.');
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
        setNote('Thank you — you’re on the list.');
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
    <>
      <div className="bg" />
      <div className="grain" />
      <div className="frame">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
      </div>

      <main className="wrap">
        <p className="eyebrow">Fine Fragrance · Est. MMXXVI</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="icon" src={LOGO_DATA_URL} alt="Beyond The Body" />

        <h1>
          <span className="line l1"><span>Beyond</span></span>
          <span className="line l2"><span>the</span></span>
          <span className="line l3"><span>Body<sup className="tm">®</sup></span></span>
        </h1>

        <div className="rule" />

        <p className="tag">
          A new chapter in scent is unfolding. Our first <em>eau de parfum</em> —
          composed for those who move beyond the ordinary. Arriving soon.
        </p>

        <div className="count" aria-label="Countdown to launch">
          <div className="unit"><span className="num">{time.d}</span><span className="lbl">Days</span></div>
          <span className="sep">:</span>
          <div className="unit"><span className="num">{time.h}</span><span className="lbl">Hours</span></div>
          <span className="sep">:</span>
          <div className="unit"><span className="num">{time.m}</span><span className="lbl">Minutes</span></div>
          <span className="sep">:</span>
          <div className="unit"><span className="num">{time.s}</span><span className="lbl">Seconds</span></div>
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
              {pending ? 'Sending…' : 'Notify Me'}
            </button>
          </div>
          <p className={`note${ok ? ' ok' : ''}`}>{note}</p>
        </form>

        <nav className="social">
          <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Contact</a>
        </nav>
      </main>
    </>
  );
}
