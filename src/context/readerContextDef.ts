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
}

export type ReaderContextValue = ReaderState & ReaderActions;

export const ReaderContext = createContext<ReaderContextValue | undefined>(undefined);
