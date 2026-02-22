/**
 * ReaderContext
 *
 * Central state store for the RSVP reader. Provides words array, playback
 * state, speed (WPM), file metadata, and loading progress to all components.
 * Word index is also persisted in localStorage so the user can resume reading.
 */
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { ReaderContext, type FileMetadata } from './readerContextDef';

const LS_KEY_INDEX = 'fastread_word_index';
const LS_KEY_WPM = 'fastread_wpm';
const DEFAULT_WPM = 250;

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [words, setWordsState] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndexState] = useState<number>(() => {
    const saved = localStorage.getItem(LS_KEY_INDEX);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpmState] = useState<number>(() => {
    const saved = localStorage.getItem(LS_KEY_WPM);
    return saved ? parseInt(saved, 10) : DEFAULT_WPM;
  });
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Persist word index to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LS_KEY_INDEX, String(currentWordIndex));
  }, [currentWordIndex]);

  // Persist WPM
  useEffect(() => {
    localStorage.setItem(LS_KEY_WPM, String(wpm));
  }, [wpm]);

  const setWords = useCallback((newWords: string[]) => {
    setWordsState(newWords);
    // Reset index when a new file is loaded
    setCurrentWordIndexState(0);
    localStorage.setItem(LS_KEY_INDEX, '0');
  }, []);

  const setCurrentWordIndex = useCallback((index: number) => {
    setCurrentWordIndexState(index);
  }, []);

  const setWpm = useCallback((newWpm: number) => {
    setWpmState(newWpm);
  }, []);

  const resetReader = useCallback(() => {
    setCurrentWordIndexState(0);
    setIsPlaying(false);
    localStorage.setItem(LS_KEY_INDEX, '0');
  }, []);

  return (
    <ReaderContext.Provider
      value={{
        words,
        currentWordIndex,
        isPlaying,
        wpm,
        fileMetadata,
        isLoading,
        loadingProgress,
        setWords,
        setCurrentWordIndex,
        setIsPlaying,
        setWpm,
        setFileMetadata,
        setIsLoading,
        setLoadingProgress,
        resetReader,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

