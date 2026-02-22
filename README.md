# ⚡ Fast Read — RSVP Reader

A production-quality React web application that implements **Rapid Serial Visual Presentation (RSVP)** reading for PDF and EPUB files. All processing runs entirely in the browser — no backend required.

---

## Features

- **Upload** PDF or EPUB files (up to 100 MB)
- **Display** one word at a time in a fixed focal position
- **Adjustable speed** via logarithmic slider (60–1000 WPM)
- **Controls:** Play, Pause, Faster, Slower, Restart
- **Keyboard shortcuts:** `Space` = Play/Pause, `↑` = Faster, `↓` = Slower
- **Persists** current word index and WPM to localStorage (resume reading after refresh)
- **Progress indicator** during file parsing and reading

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| PDF parsing | pdfjs-dist |
| EPUB parsing | epubjs |
| Styling | CSS Modules + vanilla CSS |
| State | React Context API |

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
src/
├── components/
│   ├── Controls.tsx         # Playback controls, speed slider, file upload
│   └── ReaderViewport.tsx   # Fixed-position word display
├── context/
│   ├── ReaderContext.tsx    # ReaderProvider component (state)
│   ├── readerContextDef.ts  # Context object + TypeScript types
│   └── useReaderContext.ts  # useReaderContext hook
├── hooks/
│   └── useRSVPEngine.ts     # RSVP engine with drift-corrected timing
├── parsers/
│   ├── pdfParser.ts         # pdfjs-dist page-by-page async generator
│   └── epubParser.ts        # epubjs chapter-by-chapter async generator
├── utils/
│   └── textUtils.ts         # normalizeText / tokenize helpers
└── styles/
    ├── app.css              # Global layout styles
    ├── Controls.module.css  # Controls component styles
    └── ReaderViewport.module.css  # Viewport component styles
```

---

## Architecture Decisions

### Async generators for parsing
Both `parsePDF` and `parseEPUB` are **async generators** that yield text one page/chapter at a time. This means:
- The UI shows loading progress after each page/chapter
- The main thread is never blocked for more than one page at a time
- Memory usage stays low even for large files (words are small strings)

### Drift-corrected timing
`useRSVPEngine` uses `setInterval` with drift correction. After each tick it calculates the difference between the expected and actual fire time and adjusts the next interval accordingly. This prevents timing drift at high WPM rates.

### React Context for state
All reader state lives in `ReaderContext`. The hook `useRSVPEngine` reads from and writes to the context. Components only re-render when the specific slice of state they consume changes.

### CSS Modules for scoped styles
Each component has its own `.module.css` file preventing style leakage. Global structural styles live in `src/styles/app.css`.

### localStorage persistence
`currentWordIndex` and `wpm` are synced to `localStorage` via `useEffect`, letting users resume reading after a page refresh.

---

## Performance Considerations

- **No full-document preload:** PDFs are processed page-by-page using pdfjs-dist streaming API; EPUB chapters are loaded one at a time.
- **`React.memo` on ReaderViewport:** The word display only re-renders when the word changes, not on any other state update.
- **Refs in engine:** The RSVP engine interval callback reads the current word index via a ref (not closure) to avoid stale values without triggering re-renders.
- **`will-change: transform`** on the word element enables GPU compositing for the word-appear animation.

