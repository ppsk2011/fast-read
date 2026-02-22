/**
 * useRSVPEngine
 *
 * Core hook that drives the word-by-word display.
 *
 * Architecture decisions:
 * - Uses setInterval with drift correction so high WPM rates don't accumulate
 *   timing errors. The interval is restarted whenever WPM changes so the new
 *   speed takes effect immediately without resetting position.
 * - Current word index is mirrored in a ref inside the engine so the interval
 *   callback can read/write it without stale-closure issues.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useReaderContext } from '../context/useReaderContext';

export function useRSVPEngine() {
  const {
    words,
    currentWordIndex,
    isPlaying,
    wpm,
    setCurrentWordIndex,
    setIsPlaying,
    resetReader,
    setWpm,
  } = useReaderContext();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Mirror of currentWordIndex accessible inside interval callback without stale closure
  const indexRef = useRef<number>(currentWordIndex);
  const wordsLenRef = useRef<number>(words.length);
  // Track the expected time of the next tick for drift correction
  const nextTickRef = useRef<number>(0);

  // Keep refs in sync with state
  useEffect(() => {
    indexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  useEffect(() => {
    wordsLenRef.current = words.length;
  }, [words.length]);

  const clearEngine = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startEngine = useCallback(
    (intervalMs: number) => {
      clearEngine();
      nextTickRef.current = performance.now() + intervalMs;

      intervalRef.current = setInterval(() => {
        const now = performance.now();
        // Drift correction: adjust next expected tick based on how late we fired
        const drift = now - nextTickRef.current;
        nextTickRef.current = now + intervalMs - drift;

        const nextIndex = indexRef.current + 1;
        if (nextIndex >= wordsLenRef.current) {
          // Reached end – stop playback
          clearEngine();
          setIsPlaying(false);
          return;
        }
        indexRef.current = nextIndex;
        setCurrentWordIndex(nextIndex);
      }, intervalMs);
    },
    [clearEngine, setCurrentWordIndex, setIsPlaying],
  );

  // (Re)start engine whenever play state, speed, or word list changes
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const intervalMs = 60_000 / wpm;
      startEngine(intervalMs);
    } else {
      clearEngine();
    }
    return clearEngine;
  }, [isPlaying, wpm, words.length, startEngine, clearEngine]);

  const play = useCallback(() => setIsPlaying(true), [setIsPlaying]);
  const pause = useCallback(() => setIsPlaying(false), [setIsPlaying]);
  const reset = useCallback(() => resetReader(), [resetReader]);

  const faster = useCallback(() => {
    setWpm(Math.min(1000, Math.round(wpm * 1.2)));
  }, [setWpm, wpm]);

  const slower = useCallback(() => {
    setWpm(Math.max(60, Math.round(wpm / 1.2)));
  }, [setWpm, wpm]);

  const currentWord = words[currentWordIndex] ?? '';

  return { currentWord, play, pause, reset, faster, slower };
}
