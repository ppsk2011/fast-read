/**
 * ReaderViewport
 *
 * Displays exactly one word at a time in a fixed focal position.
 * The layout uses a centered fixed-width container so words never cause
 * layout shift regardless of their length.
 *
 * Performance: only re-renders when `currentWord` changes (memo boundary).
 */

import { memo } from 'react';
import styles from '../styles/ReaderViewport.module.css';

interface ReaderViewportProps {
  currentWord: string;
  isLoading: boolean;
  loadingProgress: number;
  hasWords: boolean;
}

const ReaderViewport = memo(function ReaderViewport({
  currentWord,
  isLoading,
  loadingProgress,
  hasWords,
}: ReaderViewportProps) {
  return (
    <div className={styles.viewport} aria-live="assertive" aria-atomic="true">
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
        <p className={styles.placeholder}>Upload a PDF or EPUB to start reading</p>
      ) : (
        <span className={styles.word}>{currentWord}</span>
      )}
      {/* Fixed focal guide line */}
      <div className={styles.focalLine} aria-hidden="true" />
    </div>
  );
});

export default ReaderViewport;
