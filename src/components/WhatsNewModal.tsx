/**
 * WhatsNewModal
 *
 * Shown once per app version. Displayed before onboarding on version bumps.
 * Dismissed with the primary CTA button — caller then decides whether to
 * show onboarding next.
 */

import { APP_VERSION } from '../version';
import styles from '../styles/WhatsNewModal.module.css';

interface WhatsNewEntry {
  icon: string;
  title: string;
  body: string;
}

const WHATS_NEW: WhatsNewEntry[] = [
  {
    icon: '⬛',
    title: 'AMOLED Pure Black Theme',
    body: 'True #000000 backgrounds that turn pixels off on OLED screens — maximum contrast, minimum battery drain.',
  },
  {
    icon: '↺',
    title: 'Reset Button Fixed',
    body: 'The reset icon now uses the universally recognised counter-clockwise refresh arrow, matching every major browser and OS.',
  },
  {
    icon: '☰',
    title: 'iOS Menu Bars Fixed',
    body: 'The three-bar hamburger icon now renders correctly on all iOS Safari versions.',
  },
  {
    icon: '▣',
    title: 'Consistent Panel Corners',
    body: 'The reading viewport, page context panel, and playback bar now share the same rounded corners for a cohesive look.',
  },
];

interface WhatsNewModalProps {
  onDismiss: () => void;
}

export default function WhatsNewModal({ onDismiss }: WhatsNewModalProps) {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="What's new">
      <div className={styles.card}>

        <div className={styles.header}>
          <span className={styles.versionBadge}>{APP_VERSION}</span>
          <h2 className={styles.title}>What's New</h2>
          <p className={styles.subtitle}>ReadSwift just got better</p>
        </div>

        <ul className={styles.list} role="list">
          {WHATS_NEW.map((entry) => (
            <li key={entry.title} className={styles.item}>
              <span className={styles.itemIcon} aria-hidden="true">{entry.icon}</span>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>{entry.title}</span>
                <span className={styles.itemBody}>{entry.body}</span>
              </div>
            </li>
          ))}
        </ul>

        <button className={styles.dismissBtn} onClick={onDismiss} autoFocus>
          Got it — let's read
        </button>

      </div>
    </div>
  );
}
