/**
 * ReadingHistory
 *
 * Displays a collapsible list of reading records saved in localStorage.
 * Each record shows the file name, reading progress, and the last-read date.
 * Records can be individually deleted.
 */

import { useCallback } from 'react';
import { useReaderContext } from '../context/useReaderContext';
import { deleteRecord } from '../utils/recordsUtils';
import styles from '../styles/ReadingHistory.module.css';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ReadingHistory() {
  const { records, setRecords } = useReaderContext();

  const handleDelete = useCallback(
    (name: string) => {
      setRecords(deleteRecord(name));
    },
    [setRecords],
  );

  if (records.length === 0) return null;

  return (
    <section className={styles.history} aria-label="Reading history">
      <h2 className={styles.heading}>📚 Reading History</h2>
      <ul className={styles.list}>
        {records.map((record) => {
          const progress =
            record.wordCount > 1
              ? Math.min(
                  100,
                  Math.round(
                    (record.lastWordIndex / (record.wordCount - 1)) * 100,
                  ),
                )
              : 0;
          return (
            <li key={record.name} className={styles.item}>
              <div className={styles.info}>
                <span className={styles.name} title={record.name}>
                  {record.name}
                </span>
                <span className={styles.meta}>
                  {progress}% · {record.wordCount.toLocaleString()} words ·{' '}
                  {formatDate(record.lastReadAt)}
                </span>
                <div className={styles.bar} aria-hidden="true">
                  <div
                    className={styles.fill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(record.name)}
                title={`Remove record for ${record.name}`}
                aria-label={`Remove record for ${record.name}`}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
