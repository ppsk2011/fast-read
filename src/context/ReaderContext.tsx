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
  useMemo,
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
  const [pageBreaks, setPageBreaksState] = useState<number[]>([]);

  // Derive 1-indexed current page via binary search over pageBreaks
  const currentPage = useMemo(() => {
    if (pageBreaks.length === 0) return 1;
    let lo = 0;
    let hi = pageBreaks.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (pageBreaks[mid] <= currentWordIndex) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }, [pageBreaks, currentWordIndex]);

  const totalPages = pageBreaks.length;

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
    // Reset index and page breaks when a new file is loaded
    setCurrentWordIndexState(0);
    setPageBreaksState([]);
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

  const setPageBreaks = useCallback((breaks: number[]) => {
    setPageBreaksState(breaks);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (pageBreaks.length === 0) return;
      const clamped = Math.max(1, Math.min(page, pageBreaks.length));
      const wordIndex = pageBreaks[clamped - 1];
      setCurrentWordIndexState(wordIndex);
      setIsPlaying(false);
      localStorage.setItem(LS_KEY_INDEX, String(wordIndex));
    },
    [pageBreaks],
  );

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
        pageBreaks,
        currentPage,
        totalPages,
        setWords,
        setCurrentWordIndex,
        setIsPlaying,
        setWpm,
        setFileMetadata,
        setIsLoading,
        setLoadingProgress,
        resetReader,
        setPageBreaks,
        goToPage,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

