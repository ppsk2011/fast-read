/**
 * ContextPreview
 *
 * Shows a scrollable excerpt of the current page (or a ±60-word window when
 * no page boundaries are known). The current word is highlighted in the brand
 * colour and every word is clickable to jump directly to it.
 *
 * The component auto-scrolls so the active word stays visible whenever the
 * current word index changes.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useReaderContext } from '../context/useReaderContext';
import styles from '../styles/ContextPreview.module.css';

/** Half-window size used when no page boundaries are available */
const WINDOW_HALF = 60;

export default function ContextPreview() {
  const {
    words,
    currentWordIndex,
    pageBreaks,
    currentPage,
    goToWord,
    isLoading,
  } = useReaderContext();

  const activeRef = useRef<HTMLSpanElement>(null);

  // Compute the visible range of words to render
  // pageBreaks is 0-indexed (pageBreaks[i] = first word index of page i+1)
  // currentPage is 1-indexed, so currentPage-1 maps to pageBreaks index
  let start: number;
  let end: number;
  if (pageBreaks.length > 0) {
    const pageIdx = Math.max(0, Math.min(currentPage - 1, pageBreaks.length - 1));
    start = pageBreaks[pageIdx];
    end =
      pageIdx + 1 < pageBreaks.length
        ? pageBreaks[pageIdx + 1]
        : words.length;
  } else {
    start = Math.max(0, currentWordIndex - WINDOW_HALF);
    end = Math.min(words.length, currentWordIndex + WINDOW_HALF + 1);
  }

  const visibleWords = words.slice(start, end);

  // Auto-scroll the active word into view on index change
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentWordIndex]);

  const handleWordClick = useCallback(
    (globalIndex: number) => {
      goToWord(globalIndex);
    },
    [goToWord],
  );

  if (!words.length || isLoading) return null;

  return (
    <div className={styles.preview} aria-label="Page text preview">
      <p className={styles.heading}>Context</p>
      <div className={styles.content}>
        {visibleWords.map((word, i) => {
          const globalIndex = start + i;
          const isActive = globalIndex === currentWordIndex;
          return (
            <span
              key={globalIndex}
              ref={isActive ? activeRef : undefined}
              className={isActive ? styles.activeWord : styles.wordSpan}
              onClick={() => handleWordClick(globalIndex)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWordClick(globalIndex);
                }
              }}
              aria-label={`${word}${isActive ? ' (current)' : ''}`}
              aria-pressed={isActive}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
