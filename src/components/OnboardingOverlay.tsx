/**
 * OnboardingOverlay v2 — demo replicates real ReaderViewport visuals.
 * 250 WPM, ORP split, focal ticks, theme tokens throughout.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../styles/OnboardingOverlay.module.css';

const DEMO_WORDS =
  'Your eyes stay perfectly still. Each word appears exactly where you are looking. ' +
  'No scanning. No movement. Just words arriving at full speed. This is how ReadSwift works.'
  .split(/\s+/).filter(Boolean);

const DEMO_WPM = 250;
const DEMO_INTERVAL_MS = Math.round(60_000 / DEMO_WPM);

/**
 * Returns the Optimal Recognition Point (ORP) character index for a word.
 * ORP is the character position where the eye naturally fixates for fastest
 * word recognition. Formula: one position before each 5-character boundary.
 */
function calcOrpIndex(word: string): number {
  if (!word) return 0;
  return Math.max(0, Math.ceil(word.length / 5) - 1);
}

const MODES = [
  { label: 'Speed',  emoji: '⚡', wpm: '400–600', desc: 'One word, no focal line. Pure velocity.',          accent: '#f59e0b' },
  { label: 'Focus',  emoji: '🎯', wpm: '250–350', desc: 'ORP + focal line. Precision reading.',            accent: 'var(--color-accent)', recommended: true },
  { label: 'Read',   emoji: '📖', wpm: '150–250', desc: '3 words at once with context fading.',            accent: '#34d399' },
];

interface OnboardingOverlayProps { onComplete: () => void; }

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [step, setStep]       = useState(0);
  const [visible, setVisible] = useState(false);
  const [demoIndex, setDemoIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const clearDemo = useCallback(() => {
    if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const launchDemo = useCallback(() => {
    clearDemo();
    setDemoIndex(0);
    intervalRef.current = setInterval(() => {
      setDemoIndex(prev => {
        const next = prev + 1;
        if (next >= DEMO_WORDS.length) { clearInterval(intervalRef.current!); intervalRef.current = null; return prev; }
        return next;
      });
    }, DEMO_INTERVAL_MS);
  }, [clearDemo]);

  useEffect(() => () => clearDemo(), [clearDemo]);

  const advance = useCallback(() => {
    if (step < 3) {
      const next = step + 1;
      setStep(next);
      if (next === 1) launchDemo();
      else clearDemo();
    } else {
      onComplete();
    }
  }, [step, onComplete, launchDemo, clearDemo]);

  const skip = useCallback(() => onComplete(), [onComplete]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Enter') advance(); if (e.key === 'Escape') skip(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [advance, skip]);

  const rawWord  = demoIndex >= 0 && demoIndex < DEMO_WORDS.length ? DEMO_WORDS[demoIndex] : '';
  const orpIdx   = calcOrpIndex(rawWord);
  const preORP   = rawWord.slice(0, orpIdx);
  const orpChar  = rawWord[orpIdx] ?? '';
  const postORP  = rawWord.slice(orpIdx + 1);
  const demoFinished = demoIndex === DEMO_WORDS.length - 1;

  return (
    <div className={`${styles.overlay} ${visible ? styles.overlayVisible : ''}`}
         role="dialog" aria-modal="true" aria-label="Welcome to ReadSwift">
      <div className={styles.panel}>

        <div className={styles.dots} aria-label={`Step ${step + 1} of 4`}>
          {[0,1,2,3].map(i => (
            <span key={i} className={`${styles.dot} ${i === step ? styles.dotActive : ''}`} aria-hidden="true" />
          ))}
        </div>

        <div className={styles.stepContent} key={step}>

          {/* Step 0 — Value prop */}
          {step === 0 && (
            <div className={styles.step}>
              <div className={styles.heroIcon} aria-hidden="true">⚡</div>
              <h1 className={styles.heading}>Read 2× faster.<br />Same comprehension.</h1>
              <p className={styles.body}>
                ReadSwift uses RSVP — Rapid Serial Visual Presentation — to eliminate
                the eye movement that slows every reader down.
              </p>
              <div className={styles.statRow}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>250</span>
                  <span className={styles.statLabel}>avg WPM without training</span>
                </div>
                <span className={styles.statArrow} aria-hidden="true">→</span>
                <div className={styles.stat}>
                  <span className={styles.statNum} style={{ color: 'var(--color-accent)' }}>500+</span>
                  <span className={styles.statLabel}>WPM within one week</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Live demo */}
          {step === 1 && (
            <div className={styles.step}>
              <h1 className={styles.heading}>See it in action</h1>

              <div className={styles.demoViewport} aria-live="polite" aria-atomic="true">
                {demoIndex >= 0 && (
                  <>
                    <div className={styles.demoTickTop}    aria-hidden="true" />
                    <div className={styles.demoTickBottom} aria-hidden="true" />
                  </>
                )}
                {demoIndex === -1 ? (
                  <span className={styles.demoPlaceholder}>Get ready…</span>
                ) : (
                  <div className={styles.demoWordRow}>
                    <span className={styles.demoPreOrp}>{preORP}</span>
                    <span className={styles.demoOrpChar}>{orpChar}</span>
                    <span className={styles.demoPostOrp}>{postORP}</span>
                  </div>
                )}
              </div>

              <p className={styles.demoCaption}>
                {demoFinished
                  ? 'Your eyes stayed still the entire time. That is RSVP.'
                  : `${DEMO_WPM} WPM — words appear at a fixed point`}
              </p>
              <div className={styles.wpmChip} aria-hidden="true">
                <span className={styles.wpmDot} />{DEMO_WPM} WPM
              </div>
            </div>
          )}

          {/* Step 2 — Load content */}
          {step === 2 && (
            <div className={styles.step}>
              <h1 className={styles.heading}>Load anything</h1>
              <div className={styles.inputCards}>
                {[
                  { icon: '📂', title: 'Upload a file',  desc: 'PDF · EPUB · DOCX · TXT · MD · HTML · SRT' },
                  { icon: '📋', title: 'Paste text',     desc: 'Copy from anywhere — clipboard auto-detected' },
                  { icon: '🔗', title: 'Paste a URL',    desc: 'Fetches and extracts any web article' },
                ].map(card => (
                  <div key={card.title} className={styles.inputCard}>
                    <span className={styles.inputCardIcon} aria-hidden="true">{card.icon}</span>
                    <div>
                      <strong>{card.title}</strong>
                      <span className={styles.inputFormats}>{card.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.privacyNote}>🔒 All processing is local. No account needed.</p>
            </div>
          )}

          {/* Step 3 — Modes */}
          {step === 3 && (
            <div className={styles.step}>
              <h1 className={styles.heading}>Choose your mode</h1>
              <div className={styles.modeCards}>
                {MODES.map(mode => (
                  <div key={mode.label}
                       className={`${styles.modeCard} ${mode.recommended ? styles.modeCardRec : ''}`}
                       style={{ borderLeftColor: mode.accent }}>
                    <span className={styles.modeEmoji} aria-hidden="true">{mode.emoji}</span>
                    <div className={styles.modeInfo}>
                      <span className={styles.modeLabel}>
                        {mode.label}
                        {mode.recommended && <span className={styles.modeBadge}>Start here</span>}
                      </span>
                      <span className={styles.modeWpm} style={{ color: mode.accent }}>{mode.wpm} WPM</span>
                      <span className={styles.modeDesc}>{mode.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.modeNote}>Switch modes anytime from the ☰ menu.</p>
            </div>
          )}

        </div>

        <div className={styles.actions}>
          {step === 1 && <button className={styles.btnSecondary} onClick={launchDemo}>Replay</button>}
          <button className={styles.btnPrimary} onClick={advance}>
            {step < 3 ? 'Next →' : 'Start Reading →'}
          </button>
          <button className={styles.btnSkip} onClick={skip}>Skip</button>
        </div>

      </div>
    </div>
  );
}
