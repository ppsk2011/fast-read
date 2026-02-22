/**
 * Controls
 *
 * Playback controls bar: file upload, play/pause, restart, speed slider and
 * WPM readout.
 *
 * Speed slider uses a logarithmic scale so fine-grained control is available
 * at lower speeds while still reaching high WPM values.
 * Range: 60–1000 WPM mapped to slider 0–100.
 */

import React, { useCallback, useRef } from 'react';
import { useReaderContext } from '../context/useReaderContext';
import styles from '../styles/Controls.module.css';

const MIN_WPM = 60;
const MAX_WPM = 1000;
const SLIDER_MIN = 0;
const SLIDER_MAX = 100;

/** Convert WPM to logarithmic slider value (0–100) */
function wpmToSlider(wpm: number): number {
  return (
    ((Math.log(wpm) - Math.log(MIN_WPM)) /
      (Math.log(MAX_WPM) - Math.log(MIN_WPM))) *
    (SLIDER_MAX - SLIDER_MIN)
  );
}

/** Convert logarithmic slider value (0–100) to WPM */
function sliderToWpm(sliderVal: number): number {
  return Math.round(
    Math.exp(
      Math.log(MIN_WPM) +
        (sliderVal / SLIDER_MAX) * (Math.log(MAX_WPM) - Math.log(MIN_WPM)),
    ),
  );
}

interface ControlsProps {
  onFileSelect: (file: File) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onFaster: () => void;
  onSlower: () => void;
}

export default function Controls({
  onFileSelect,
  onPlay,
  onPause,
  onReset,
  onFaster,
  onSlower,
}: ControlsProps) {
  const { isPlaying, wpm, setWpm, words, isLoading, currentWordIndex } =
    useReaderContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
        // Reset input so the same file can be re-uploaded
        e.target.value = '';
      }
    },
    [onFileSelect],
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWpm(sliderToWpm(Number(e.target.value)));
    },
    [setWpm],
  );

  const hasWords = words.length > 0;
  const progress =
    hasWords ? Math.round((currentWordIndex / Math.max(words.length - 1, 1)) * 100) : 0;

  return (
    <div className={styles.controls}>
      {/* File upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.epub"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        aria-label="Upload PDF or EPUB file"
      />
      <button
        className={styles.uploadBtn}
        onClick={handleFileClick}
        disabled={isLoading}
        title="Upload PDF or EPUB (max 100 MB)"
      >
        📂 Upload
      </button>

      {/* Playback controls */}
      <button
        className={styles.controlBtn}
        onClick={isPlaying ? onPause : onPlay}
        disabled={!hasWords || isLoading}
        title="Play / Pause (Space)"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <button
        className={styles.controlBtn}
        onClick={onReset}
        disabled={!hasWords || isLoading}
        title="Restart"
        aria-label="Restart"
      >
        ↩
      </button>

      {/* Speed controls */}
      <button
        className={styles.speedBtn}
        onClick={onSlower}
        disabled={isLoading}
        title="Slower (↓)"
        aria-label="Slower"
      >
        −
      </button>

      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={1}
          value={wpmToSlider(wpm)}
          onChange={handleSliderChange}
          className={styles.slider}
          aria-label={`Reading speed: ${wpm} words per minute`}
        />
        <span className={styles.wpmLabel}>{wpm} WPM</span>
      </div>

      <button
        className={styles.speedBtn}
        onClick={onFaster}
        disabled={isLoading}
        title="Faster (↑)"
        aria-label="Faster"
      >
        +
      </button>

      {/* Progress indicator */}
      {hasWords && (
        <span className={styles.progress} aria-label="Reading progress">
          {progress}%
        </span>
      )}
    </div>
  );
}
