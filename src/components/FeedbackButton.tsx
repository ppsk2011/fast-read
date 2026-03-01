/**
 * FeedbackButton
 *
 * A small "💬 Feedback" link in the app header.
 * Opens a free Google Form in a new tab so visitors can leave feedback.
 *
 * Setup:
 *   1. Go to https://forms.google.com and create a new form.
 *   2. Click "Send" → share link → copy the shortened URL (e.g. https://forms.gle/XXXXXXXXX).
 *   3. Set VITE_FEEDBACK_FORM_URL=<your-form-url> in your .env file.
 */

import styles from '../styles/FeedbackButton.module.css';

const FEEDBACK_FORM_URL = import.meta.env.VITE_FEEDBACK_FORM_URL as string | undefined;

export default function FeedbackButton() {
  if (!FEEDBACK_FORM_URL) return null;

  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.feedbackBtn}
      aria-label="Submit feedback about ReadSwift"
      title="Share your feedback — it helps us improve!"
    >
      💬 Feedback
    </a>
  );
}
