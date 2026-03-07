/**
 * InputPanel v2
 *
 * Smart paste panel: single textarea handles both plain text and URLs.
 * - On open: attempts clipboard read and auto-fills if text is found
 * - URL detection: if value starts with http(s)://, switches to fetch mode
 * - Live word count + reading time shown as user types
 * - Full-width "Start Reading →" CTA
 *
 * Position: unchanged — rendered inside .pasteArea in App.tsx
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseRawText } from '../parsers/textParser';
import { parseUrl }     from '../parsers/urlParser';
import styles from '../styles/InputPanel.module.css';

interface InputPanelProps {
  onTextReady: (words: string[], sourceName: string, rawLines?: string[]) => void;
  /** Called when panel should close (e.g. after successful load) */
  onClose?: () => void;
  /** User's current WPM — used to compute reading-time estimate */
  wpm?: number;
}

/** Minimum clipboard content length (chars) to trigger auto-fill */
const MIN_CLIPBOARD_LENGTH = 10;

/** Detect if string looks like a URL the urlParser can handle */
function isUrl(text: string): boolean {
  const t = text.trim();
  return t.startsWith('http://') || t.startsWith('https://');
}

/** Count words in a raw string (same split logic as parseRawText) */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Format minutes into a readable string: "< 1 min", "2 min", "1 h 3 min" */
function formatTime(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export default function InputPanel({ onTextReady, onClose, wpm = 250 }: InputPanelProps) {
  const [value, setValue]         = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [clipboardUsed, setClipboardUsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Clipboard auto-fill on mount ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function tryClipboard() {
      try {
        // navigator.clipboard.readText() works when the panel is opened via a
        // user gesture (e.g. button click) — browsers grant clipboard access in
        // that context. If permission is denied or unavailable, we catch silently.
        const text = await navigator.clipboard.readText();
        if (cancelled) return;
        const trimmed = text.trim();

        // Only auto-fill if clipboard has meaningful content
        if (trimmed.length > MIN_CLIPBOARD_LENGTH) {
          setValue(trimmed);
          setClipboardUsed(true);
          // Focus so user can edit immediately
          textareaRef.current?.focus();
          textareaRef.current?.select();
        }
      } catch {
        // Clipboard access denied or unavailable — silent fail, user pastes manually
      }
    }

    tryClipboard();
    return () => { cancelled = true; };
  }, []); // Run once on panel open

  // ── Derived state ────────────────────────────────────────────────
  const trimmed  = value.trim();
  const urlMode  = isUrl(trimmed);
  const wordCount = urlMode ? 0 : countWords(trimmed);
  const hasContent = trimmed.length > 0;

  // Reading time estimate — only meaningful for plain text
  const readingMinutes = wpm > 0 && wordCount > 0
    ? wordCount / wpm
    : 0;

  // ── Submit handler ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!hasContent) {
      setError('Paste some text or enter a URL first.');
      textareaRef.current?.focus();
      return;
    }

    if (urlMode) {
      // URL fetch mode
      setIsFetching(true);
      try {
        const { words, rawLines } = await parseUrl(trimmed);
        if (words.length === 0) {
          setError('Could not extract readable text from that URL. Try copying and pasting the article text instead.');
          return;
        }
        // Derive a source name from the URL hostname
        let sourceName = 'Web article';
        try { sourceName = new URL(trimmed).hostname.replace('www.', ''); } catch { /* ignore */ }
        onTextReady(words, sourceName, rawLines);
        setValue('');
        onClose?.();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch URL.';
        setError(msg);
      } finally {
        setIsFetching(false);
      }
    } else {
      // Plain text mode
      const { words, rawLines } = parseRawText(trimmed, 'paste');
      if (words.length === 0) {
        setError('No readable words found.');
        return;
      }
      onTextReady(words, 'Pasted text', rawLines);
      setValue('');
      onClose?.();
    }
  }, [trimmed, urlMode, hasContent, onTextReady, onClose]);

  // Submit on Ctrl+Enter / Cmd+Enter
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // ── Render ───────────────────────────────────────────────────────

  const placeholder = urlMode
    ? 'https://example.com/article — press Start Reading to fetch'
    : 'Paste your text here, or enter a URL starting with https://…';

  const ctaLabel = isFetching
    ? 'Fetching…'
    : urlMode
      ? 'Fetch & Read →'
      : 'Start Reading →';

  return (
    <div className={styles.panel}>

      {/* Clipboard auto-fill notice */}
      {clipboardUsed && (
        <div className={styles.clipboardBanner}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round"
               strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="2" width="6" height="4" rx="1"/>
            <path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/>
          </svg>
          Clipboard text auto-filled — edit or tap Start Reading
          <button
            className={styles.clipboardDismiss}
            onClick={() => setClipboardUsed(false)}
            aria-label="Dismiss clipboard notice"
          >✕</button>
        </div>
      )}

      {/* URL mode indicator */}
      {urlMode && (
        <div className={styles.urlBanner}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round"
               strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          URL detected — article will be fetched automatically
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className={`${styles.textarea} ${urlMode ? styles.textareaUrl : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
          if (clipboardUsed) setClipboardUsed(false);
        }}
        onKeyDown={handleKeyDown}
        rows={4}
        aria-label="Paste text or enter URL to read"
        disabled={isFetching}
        autoFocus={!clipboardUsed}
        spellCheck={false}
      />

      {/* Footer row: metadata left, CTA right */}
      <div className={styles.footer}>

        {/* Live metadata */}
        <div className={styles.meta}>
          {!urlMode && wordCount > 0 && (
            <>
              <span className={styles.metaChip}>
                {wordCount.toLocaleString()} words
              </span>
              {readingMinutes > 0 && (
                <span className={styles.metaChip}>
                  ~{formatTime(readingMinutes)} at {wpm} WPM
                </span>
              )}
            </>
          )}
          {!hasContent && (
            <span className={styles.metaHint}>
              Ctrl+Enter to load
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!hasContent || isFetching}
          aria-label={ctaLabel}
        >
          {isFetching && (
            <span className={styles.spinner} aria-hidden="true" />
          )}
          {ctaLabel}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}

    </div>
  );
}
