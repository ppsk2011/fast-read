/**
 * readerContextDef
 *
 * Defines the ReaderContext types and creates the context object.
 * Kept in a non-component file so that ReaderContext.tsx can export only
 * the ReaderProvider component (required by react-refresh).
 */

import { createContext } from 'react';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

interface ReaderState {
  words: string[];
  currentWordIndex: number;
  isPlaying: boolean;
  wpm: number;
  fileMetadata: FileMetadata | null;
  isLoading: boolean;
  loadingProgress: number; // 0–100
  /** Word index where each page/chapter starts (pageBreaks[0] is always 0) */
  pageBreaks: number[];
  /** 1-indexed current page derived from currentWordIndex + pageBreaks */
  currentPage: number;
  /** Total number of pages/chapters (equals pageBreaks.length, 0 when unknown) */
  totalPages: number;
}

interface ReaderActions {
  setWords: (words: string[]) => void;
  setCurrentWordIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setWpm: (wpm: number) => void;
  setFileMetadata: (meta: FileMetadata | null) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  resetReader: () => void;
  setPageBreaks: (breaks: number[]) => void;
  goToPage: (page: number) => void;
  /** Jump to a specific 0-indexed word and pause playback */
  goToWord: (index: number) => void;
}

export type ReaderContextValue = ReaderState & ReaderActions;

export const ReaderContext = createContext<ReaderContextValue | undefined>(undefined);
