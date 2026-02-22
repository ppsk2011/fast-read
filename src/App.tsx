/**
 * App
 *
 * Root component. Wires together:
 *  - File parsing (PDF/EPUB)
 *  - ReaderContext state
 *  - useRSVPEngine hook
 *  - Keyboard shortcuts
 *  - ReaderViewport + Controls
 */

import { useCallback, useEffect } from 'react';
import { useReaderContext } from './context/useReaderContext';
import { useRSVPEngine } from './hooks/useRSVPEngine';
import ReaderViewport from './components/ReaderViewport';
import Controls from './components/Controls';
import { parsePDF } from './parsers/pdfParser';
import { parseEPUB } from './parsers/epubParser';
import { normalizeText, tokenize } from './utils/textUtils';
import './styles/app.css';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export default function App() {
  const {
    words,
    currentWordIndex,
    isPlaying,
    isLoading,
    loadingProgress,
    setWords,
    setFileMetadata,
    setIsLoading,
    setLoadingProgress,
    setIsPlaying,
  } = useReaderContext();

  const { currentWord, play, pause, reset, faster, slower } = useRSVPEngine();

  /** Handle a file selected by the user */
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File is too large (max 100 MB). Selected file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
        );
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'epub') {
        alert('Only PDF and EPUB files are supported.');
        return;
      }

      setIsPlaying(false);
      setIsLoading(true);
      setLoadingProgress(0);
      setFileMetadata({ name: file.name, size: file.size, type: ext });

      const allWords: string[] = [];

      try {
        if (ext === 'pdf') {
          for await (const pageText of parsePDF(file, (p) =>
            setLoadingProgress(p.percent),
          )) {
            const normalized = normalizeText(pageText);
            allWords.push(...tokenize(normalized));
          }
        } else {
          for await (const chapterText of parseEPUB(file, (p) =>
            setLoadingProgress(p.percent),
          )) {
            const normalized = normalizeText(chapterText);
            allWords.push(...tokenize(normalized));
          }
        }

        if (allWords.length === 0) {
          alert('No readable text found in this file.');
        } else {
          setWords(allWords);
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        alert('Failed to parse the file. Please try a different PDF or EPUB.');
      } finally {
        setIsLoading(false);
        setLoadingProgress(100);
      }
    },
    [setIsPlaying, setIsLoading, setLoadingProgress, setFileMetadata, setWords],
  );

  /** Global keyboard shortcuts */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when focus is on an interactive element
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'button' || tag === 'select') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) { pause(); } else { play(); }
          break;
        case 'ArrowUp':
          e.preventDefault();
          faster();
          break;
        case 'ArrowDown':
          e.preventDefault();
          slower();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, faster, slower]);

  return (
    <div className="appWrapper">
      <header className="appHeader">
        <h1>⚡ Fast Read</h1>
        <p className="subtitle">RSVP Reader — one word at a time</p>
      </header>

      <main className="appMain">
        <ReaderViewport
          currentWord={currentWord}
          isLoading={isLoading}
          loadingProgress={loadingProgress}
          hasWords={words.length > 0}
        />

        {words.length > 0 && !isLoading && (
          <div className="wordCount" aria-label="Word position">
            {currentWordIndex + 1} / {words.length}
          </div>
        )}

        <Controls
          onFileSelect={handleFileSelect}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onFaster={faster}
          onSlower={slower}
        />

        <section className="shortcuts" aria-label="Keyboard shortcuts">
          <kbd>Space</kbd> Play/Pause &nbsp;
          <kbd>↑</kbd> Faster &nbsp;
          <kbd>↓</kbd> Slower
        </section>
      </main>
    </div>
  );
}

