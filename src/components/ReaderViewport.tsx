/**
 * ReaderViewport
 *
 * Displays the rolling word window with a guaranteed-stable focal position.
 *
 * Layout stability guarantee:
 *   Each word slot is rendered as a 1fr grid column inside a controlled-width
 *   container (min(92vw, clamp(600px, 250px×slots, 900px))). Because every
 *   column has equal fractional width, the ORP slot is ALWAYS at a predictable
 *   horizontal position regardless of word length. Font size scales inversely
 *   with slot count via clamp() so long words never overflow their column — no
 *   reflow, no horizontal drift, no overlap.  For the ORP (center) word, JS
 *   additionally computes a proportionally scaled font-size so that even very
 *   long words are displayed at the largest readable size with no ellipsis.
 *
 * ORP (Optimal Recognition Point):
 *   When orpEnabled is true the center/ORP word is split into three spans:
 *   [prefix][orp-letter][suffix]. The ORP letter sits at approximately 20%
 *   from the left of the word (classic Spritz placement), rendered in a
 *   slightly different hue to guide the fixation point.
 *
 * Highlight index (ORP slot):
 *   - Odd window sizes (1, 3, 5): center slot = floor(n/2)
 *   - Even window sizes (2, 4): left-middle slot = n/2 - 1
 *   - Both: Math.ceil(n/2) - 1
 */

import { memo } from 'react';
import type { CSSProperties } from 'react';
import type { Orientation } from '../context/readerContextDef';
import styles from '../styles/ReaderViewport.module.css';

interface ReaderViewportProps {
  /** Ordered list of words in the current window (length = windowSize) */
  wordWindow: string[];
  /** Index within wordWindow that should be highlighted (the center word) */
  highlightIndex: number;
  /** CSS color string for the highlighted word */
  highlightColor: string;
  /** Layout direction for the word window */
  orientation: Orientation;
  /** Whether to render ORP (Optimal Recognition Point) on the center word */
  orpEnabled: boolean;
  /** Whether to dim non-center words proportional to their distance from center */
  peripheralFade: boolean;
  isLoading: boolean;
  loadingProgress: number;
  hasWords: boolean;
  /** When true, the viewport expands to fill the available vertical space */
  fullHeight?: boolean;
}

/** Non-breaking space used to keep empty window slots visible without text */
const EMPTY_SLOT_PLACEHOLDER = '\u00A0';

/**
 * Calculate the ORP index for a word (0-based character index).
 * Classic algorithm: position ≈ ceil(length / 5) - 1 (≈ 20% from left).
 * Single-character words use index 0.
 */
function calcOrpIndex(word: string): number {
  if (!word) return 0;
  return Math.max(0, Math.ceil(word.length / 5) - 1);
}

/**
 * Compute a scaled font-size CSS value that prevents the ORP (center) word
 * from overflowing its grid slot in horizontal mode.
 *
 * The CSS class already sets  font-size: clamp(MIN rem, VW_COEFF vw / slots, MAX rem).
 * This function returns the same clamp() expression multiplied by a scale
 * factor derived from the word's character count versus the available slot
 * width, so the rendered text always fits — no ellipsis, no reflow.
 *
 * A SAFETY margin (8 %) is subtracted from the slot width so that normal
 * font-metric variation never causes the word to bleed into the gap.
 *
 * Returns undefined when the word fits comfortably at the default size,
 * letting the CSS rule take effect unchanged.
 */
function computeHorizontalCenterFontSize(
  word: string,
  slotCount: number,
  isFullHeight: boolean,
): string | undefined {
  if (!word) return undefined;

  const REM_PX = 16;
  // Match the CSS clamp parameters for normal and full-height modes.
  const minFontRem = isFullHeight ? 2 : 1.1;
  const maxFontRem = isFullHeight ? 6 : 3.2;
  const vwCoeff    = isFullHeight ? 10 : 8;

  const MIN_FONT_PX      = minFontRem * REM_PX;
  const MAX_FONT_PX      = maxFontRem * REM_PX;
  /**
   * Approximate ratio of character width to font-size for Georgia serif.
   * Latin characters in Georgia average ~0.58–0.62 em; 0.60 is the midpoint.
   * If the app font ever changes, update this constant to match.
   */
  const CHAR_WIDTH       = 0.60;
  const SAFETY           = 0.92; // 8 % margin so metric variance never causes overflow
  const MIN_READABLE_PX  = 12;   // never render below this size regardless of word length

  // Container width mirrors the CSS formula:
  //   min(92vw, clamp(600px, 250px × slotCount, 900px))
  /** Fallback viewport width (px) used in non-browser (SSR) environments. */
  const DEFAULT_VIEWPORT_PX = 1280;
  const vwPx        = typeof window !== 'undefined' ? window.innerWidth / 100 : DEFAULT_VIEWPORT_PX / 100;
  const clampedPx   = Math.min(900, Math.max(600, 250 * slotCount));
  const containerPx = Math.min(0.92 * vwPx * 100, clampedPx);
  const slotPx      = containerPx / slotCount;

  // Base font size: replicate the CSS clamp using the live viewport width.
  const preferredPx = (vwCoeff * vwPx) / slotCount;
  const baseFontPx  = Math.min(MAX_FONT_PX, Math.max(MIN_FONT_PX, preferredPx));

  const maxChars = (slotPx * SAFETY) / (baseFontPx * CHAR_WIDTH);
  if (word.length <= maxChars) return undefined; // default CSS size is fine

  // Minimum scale: ensure the rendered preferred size stays above MIN_READABLE_PX.
  // At the preferred vw value the rendered size = (vwCoeff * vwPx / slotCount) * scale.
  const minScaleForReadability = MIN_READABLE_PX / Math.max(preferredPx, 1);
  const scale = Math.max(minScaleForReadability, maxChars / word.length);
  return [
    `clamp(${(minFontRem * scale).toFixed(3)}rem,`,
    ` calc(${(vwCoeff * scale).toFixed(3)}vw / ${slotCount}),`,
    ` ${(maxFontRem * scale).toFixed(3)}rem)`,
  ].join('');
}


function WordWithOrp({
  word,
  baseColor,
}: {
  word: string;
  baseColor: string;
}) {
  const idx = calcOrpIndex(word);
  const before = word.slice(0, idx);
  const orpChar = word[idx] ?? '';
  const after = word.slice(idx + 1);
  return (
    <>
      <span>{before}</span>
      {/* ORP letter — slightly brighter/larger to anchor the eye */}
      <span className={styles.orpChar} style={{ color: baseColor }}>
        {orpChar}
      </span>
      <span>{after}</span>
    </>
  );
}

const ReaderViewport = memo(function ReaderViewport({
  wordWindow,
  highlightIndex,
  highlightColor,
  orientation,
  orpEnabled,
  peripheralFade,
  isLoading,
  loadingProgress,
  hasWords,
  fullHeight,
}: ReaderViewportProps) {
  /**
   * Peripheral fade: opacity decreases with distance from the center slot.
   * Center = 1.0, distance-1 = 0.5, distance-2+ = 0.25.
   * Only applied when peripheralFade is enabled AND word count > 1.
   */
  const slotOpacity = (i: number): number => {
    if (!peripheralFade || wordWindow.length === 1) return 1;
    const dist = Math.abs(i - highlightIndex);
    if (dist === 0) return 1;
    if (dist === 1) return 0.5;
    return 0.25;
  };
  return (
    <div
      className={`${styles.viewport}${fullHeight ? ` ${styles.viewportFull}` : ''}`}
      aria-live="assertive"
      aria-atomic="true"
    >
      {isLoading ? (
        <div className={styles.loading}>
          <p>Parsing file… {loadingProgress}%</p>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={loadingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      ) : !hasWords ? (
        <p className={styles.placeholder}>
          Upload a file, paste text, or enter a URL to start reading
        </p>
      ) : (
        /*
         * Fixed-width grid: each slot gets exactly --slot-width.
         * With equal columns, slot N is always at the same horizontal
         * position regardless of word content — no layout shifts.
         */
        <div
          className={
            orientation === 'vertical' ? styles.windowVertical : styles.windowHorizontal
          }
          style={{ '--slot-count': wordWindow.length } as CSSProperties}
        >
          {wordWindow.map((word, i) => {
            const isCenter = i === highlightIndex;
            const opacity = slotOpacity(i);
            const scaledFont =
              isCenter && orientation === 'horizontal'
                ? computeHorizontalCenterFontSize(word, wordWindow.length, fullHeight ?? false)
                : undefined;
            return (
              <span
                key={i}
                className={`${styles.wordSlot}${isCenter ? ` ${styles.wordSlotCenter}` : ''}`}
                style={{
                  ...(isCenter ? { color: highlightColor } : undefined),
                  ...(opacity < 1 ? { opacity } : undefined),
                  ...(scaledFont ? { fontSize: scaledFont } : undefined),
                }}
                aria-hidden={word === '' ? true : undefined}
              >
                {word
                  ? isCenter && orpEnabled
                    ? <WordWithOrp word={word} baseColor={highlightColor} />
                    : word
                  : EMPTY_SLOT_PLACEHOLDER}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default ReaderViewport;
