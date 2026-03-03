/**
 * SessionStats
 *
 * Lightweight session analytics panel. Displays:
 *  - Words consumed this session
 *  - Effective WPM (words / active reading time)
 *  - Total active reading time
 *
 * Rendered inside the burger menu settings drawer.
 * Shows a placeholder when no reading has started yet.
 * No tracking beyond localStorage.
 */

import { memo } from 'react';
import { useReaderContext } from '../context/useReaderContext';
import styles from '../styles/SessionStats.module.css';

function formatTime(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const SessionStats = memo(function SessionStats() {
  const { sessionStats } = useReaderContext();
  const { wordsRead, activeTimeMs, effectiveWpm } = sessionStats;

  if (wordsRead === 0) {
    return (
      <p className={styles.empty}>Start reading to see your session stats.</p>
    );
  }

  return (
    <div className={styles.grid} aria-label="Session statistics">
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Words read</span>
        <span className={styles.statValue}>{wordsRead.toLocaleString()}</span>
      </div>
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Active time</span>
        <span className={styles.statValue}>{formatTime(activeTimeMs)}</span>
      </div>
      {effectiveWpm > 0 && (
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Avg speed</span>
          <span className={styles.statValue}>{effectiveWpm} WPM</span>
        </div>
      )}
    </div>
  );
});

export default SessionStats;
