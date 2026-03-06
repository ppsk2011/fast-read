/**
 * ReadingModes
 *
 * 2×2 grid of mode cards: Speed, Focus, Read, Custom.
 * Preset cards apply a full bundle of settings with one tap.
 * Custom card shows saved mode chips (max 3) and a save wizard trigger.
 */

import { useState } from 'react';
import { useReaderContext } from '../context/useReaderContext';
import { PRESET_MODES } from '../config/readingModePresets';
import type { PresetModeId } from '../types/readingModes';
import SaveModeWizard from './SaveModeWizard';
import styles from '../styles/ReadingModes.module.css';

export default function ReadingModes() {
  const {
    activeMode,
    activeCustomModeId,
    savedCustomModes,
    setSavedCustomModes,
    selectPresetMode,
    selectCustomMode,
  } = useReaderContext();

  const [wizardOpen, setWizardOpen] = useState(false);

  const deleteCustomMode = (id: string) => {
    setSavedCustomModes(savedCustomModes.filter((m) => m.id !== id));
  };

  return (
    <>
      <div className={styles.modeGrid}>
        {(['speed', 'focus', 'read'] as PresetModeId[]).map((id) => (
          <button
            key={id}
            className={`${styles.modeCard} ${activeMode === id ? styles.modeCardActive : ''}`}
            onClick={() => selectPresetMode(id)}
            aria-pressed={activeMode === id}
          >
            <span className={styles.modeIcon}>{PRESET_MODES[id].icon}</span>
            <span className={styles.modeLabel}>{PRESET_MODES[id].label}</span>
            <span className={styles.modeDesc}>{PRESET_MODES[id].description}</span>
          </button>
        ))}

        <div
          className={`${styles.modeCard} ${styles.modeCardCustom} ${activeMode === 'custom' ? styles.modeCardActive : ''}`}
          role="group"
          aria-label="Custom modes"
        >
          <span className={styles.modeLabel}>⚙️ Custom</span>
          {activeMode === 'custom' && activeCustomModeId === null && (
            <span className={styles.unsavedLabel}>Unsaved settings</span>
          )}
          {savedCustomModes.map((mode) => (
            <div key={mode.id} className={styles.customChipRow}>
              <button
                className={`${styles.customChip} ${activeCustomModeId === mode.id ? styles.customChipActive : ''}`}
                onClick={() => selectCustomMode(mode)}
                aria-pressed={activeCustomModeId === mode.id}
              >
                {mode.name}
              </button>
              <button
                className={styles.customChipDelete}
                onClick={() => deleteCustomMode(mode.id)}
                aria-label={`Delete custom mode "${mode.name}"`}
              >
                ×
              </button>
            </div>
          ))}
          {savedCustomModes.length < 3 && (
            <button className={styles.saveCustomBtn} onClick={() => setWizardOpen(true)}>
              ＋ Save current as custom
            </button>
          )}
        </div>
      </div>

      {wizardOpen && (
        <SaveModeWizard
          onClose={() => setWizardOpen(false)}
          existingModes={savedCustomModes}
        />
      )}
    </>
  );
}
