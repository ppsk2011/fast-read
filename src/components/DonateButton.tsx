/**
 * DonateButton
 *
 * A small, non-intrusive "♥ Support" button rendered in the app header.
 * Clicking it opens a modal listing donation platform options.
 * All core features remain free — this is purely optional support.
 */

import { useCallback, useEffect, useState } from 'react';
import styles from '../styles/DonateButton.module.css';

interface DonationOption {
  label: string;
  icon: string;
  url: string;
  description: string;
}

const DONATION_OPTIONS: DonationOption[] = [
  {
    label: 'Ko-fi',
    icon: '☕',
    url: 'https://ko-fi.com/readswift',
    description: 'Buy us a coffee — one-time or monthly',
  },
  {
    label: 'Buy Me a Coffee',
    icon: '🧇',
    url: 'https://buymeacoffee.com/readswift',
    description: 'Quick one-time support',
  },
  {
    label: 'Patreon',
    icon: '🎨',
    url: 'https://patreon.com/readswift',
    description: 'Become a patron for monthly support',
  },
  {
    label: 'PayPal',
    icon: '💙',
    url: 'https://paypal.me/readswift',
    description: 'Send a one-time donation via PayPal',
  },
];

export default function DonateButton() {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  /** Close on Escape key */
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, closeModal]);

  /** Close when clicking the backdrop */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) closeModal();
    },
    [closeModal],
  );

  return (
    <>
      <button
        className={styles.supportBtn}
        onClick={openModal}
        aria-label="Support ReadSwift"
        title="Support ReadSwift — all features stay free"
      >
        ♥ Support
      </button>

      {open && (
        <div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Support ReadSwift"
          onClick={handleBackdropClick}
        >
          <div className={styles.modal}>
            <button
              className={styles.closeBtn}
              onClick={closeModal}
              aria-label="Close donation dialog"
            >
              ✕
            </button>

            <h2 className={styles.title}>♥ Support ReadSwift</h2>
            <p className={styles.subtitle}>
              ReadSwift is free and always will be.
              <br />
              If it's helped you read faster, any contribution means a lot!
            </p>

            <ul className={styles.options}>
              {DONATION_OPTIONS.map((opt) => (
                <li key={opt.label}>
                  <a
                    href={opt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.optionLink}
                    onClick={closeModal}
                  >
                    <span className={styles.optionIcon}>{opt.icon}</span>
                    <span className={styles.optionText}>
                      <span className={styles.optionLabel}>{opt.label}</span>
                      <span className={styles.optionDesc}>{opt.description}</span>
                    </span>
                    <span className={styles.optionArrow}>→</span>
                  </a>
                </li>
              ))}
            </ul>

            <p className={styles.footer}>
              All core features are free, forever. No account required.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
