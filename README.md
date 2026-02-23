# ⚡ Fast Read — RSVP Reader

**by [TechScript Limited](https://techscriptlimited.ca)**

A production-quality React web application that implements **Rapid Serial Visual Presentation (RSVP)** reading for PDF and EPUB files. All processing runs entirely in the browser — no backend required.

---

## Features

- **Upload** PDF or EPUB files (up to 100 MB)
- **Display** one word at a time in a fixed focal position
- **Adjustable speed** via logarithmic slider (60–1000 WPM)
- **Controls:** Play, Pause, Faster, Slower, Restart
- **Word navigation:** step or jump to any word by number
- **Page/chapter navigation:** jump to any page (PDF) or chapter (EPUB)
- **Context preview:** side-by-side scrollable text panel with the current word highlighted and clickable
- **Reading history:** automatically records each file you open, saves your progress, and restores your last position when you re-upload the same file
- **Keyboard shortcuts:** `Space` = Play/Pause, `←/→` = Prev/Next word, `↑/↓` = Faster/Slower
- **Persists** current word index and WPM to localStorage (resume reading after refresh)
- **Progressive Web App (PWA):** installable on any device, works offline
- **Native mobile:** Android & iOS via Capacitor

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
| PWA | vite-plugin-pwa (Workbox) |
| Mobile wrapper | Capacitor 8 |

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

## Deployment

### Web — GitHub Pages + Custom Domain (techscript.ca)

The repository ships a GitHub Actions workflow (`.github/workflows/deploy-web.yml`) that automatically builds and deploys to GitHub Pages on every push to `main`. The `public/CNAME` file tells GitHub Pages to serve the site at **https://techscript.ca**.

#### Step 1 — Enable GitHub Pages

1. In your GitHub repository go to **Settings → Pages**
2. Under **Source** choose **GitHub Actions**
3. Leave the **Custom domain** field blank for now (the CNAME file handles it)

#### Step 2 — Configure DNS in GoDaddy

Log in to your [GoDaddy DNS Manager](https://dcc.godaddy.com) for the `techscript.ca` domain and add the following records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| `A` | `@` | `185.199.108.153` | 1 Hour |
| `A` | `@` | `185.199.109.153` | 1 Hour |
| `A` | `@` | `185.199.110.153` | 1 Hour |
| `A` | `@` | `185.199.111.153` | 1 Hour |
| `CNAME` | `www` | `ppsk2011.github.io` | 1 Hour |

> These are the four GitHub Pages IP addresses. The `www` CNAME lets `www.techscript.ca` also resolve to the site.

> **Important:** Delete or replace any existing `A` record for `@` that GoDaddy may have pre-populated (often pointing to a GoDaddy parking page).

#### Step 3 — Enable HTTPS

After DNS propagates (usually within 30 minutes, up to 24 hours):

1. Go back to **Settings → Pages** in GitHub
2. You should see **"Your site is live at https://techscript.ca"**
3. Tick **"Enforce HTTPS"** — GitHub will provision a free Let's Encrypt certificate automatically

#### Step 4 — Deploy

Push to `main` (or click **Actions → Deploy to GitHub Pages → Run workflow**). The site will be live at:

> **https://techscript.ca**

---

### PWA — Install on any device

The production build is a fully installable Progressive Web App:
- **Desktop (Chrome/Edge):** click the install icon in the address bar
- **Android (Chrome):** tap the "Add to Home Screen" prompt
- **iOS (Safari):** tap the Share button → "Add to Home Screen"

The service worker caches the app shell for offline use.

---

### Android — Native APK via Capacitor

**Prerequisites:** Android Studio, JDK 17+

```bash
# 1. Build the web app
npm run build

# 2. Add & sync the Android project (first time)
npx cap add android
npx cap sync android

# 3. Open in Android Studio
npm run cap:android
```

Inside Android Studio, run on a device/emulator or use
**Build → Generate Signed Bundle / APK** to produce a release APK for the Play Store.

**Automated CI builds** are produced by `.github/workflows/build-android.yml`:
- Every push to `main` produces a **debug APK** (upload artifact `fast-read-debug-apk`)
- Every tag matching `v*` produces a **release APK** (requires repository secrets below)

Required secrets for signed release builds:

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.jks` keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias inside the keystore |
| `ANDROID_KEY_PASSWORD` | Key password |

---

### iOS — Native App via Capacitor

**Prerequisites:** macOS, Xcode 15+, CocoaPods

```bash
# 1. Build the web app
npm run build

# 2. Add & sync the iOS project (first time)
npx cap add ios
npx cap sync ios

# 3. Open in Xcode
npm run cap:ios
```

Inside Xcode, configure your Team & Bundle ID, then run on a simulator / device or archive for App Store submission.

**Automated CI builds** are produced by `.github/workflows/build-ios.yml` on macOS runners. For signed App Store builds, configure signing certificates as GitHub Actions secrets following the [Xcode deployment guide](https://docs.github.com/en/actions/deployment/deploying-xcode-applications).

---

### After updating the web source

Whenever you change the app, sync the native projects:

```bash
npm run build
npm run cap:sync   # equivalent to: npx cap sync
```

---

## Project Structure

```
.
├── capacitor.config.ts     # Capacitor (mobile) configuration
├── vite.config.ts          # Vite + PWA plugin configuration
├── index.html              # HTML shell with PWA + mobile meta tags
├── public/
│   ├── icons/              # App icons (SVG + 192/512 PNG)
│   └── apple-touch-icon.png
├── .github/workflows/
│   ├── deploy-web.yml      # GitHub Pages deployment
│   ├── build-android.yml   # Android APK build
│   └── build-ios.yml       # iOS build
└── src/
    ├── components/
    │   ├── Controls.tsx         # Playback controls, speed slider, file upload
    │   ├── PageNavigator.tsx    # Page / chapter jump navigation
    │   ├── ReadingHistory.tsx   # Reading history panel with per-file progress
    │   ├── WordNavigator.tsx    # Word-level step + jump navigation
    │   ├── ContextPreview.tsx   # Side-by-side page text preview
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
    │   ├── recordsUtils.ts      # load / save / delete reading records in localStorage
    │   └── textUtils.ts         # normalizeText / tokenize helpers
    └── styles/
        ├── app.css              # Global layout styles
        └── *.module.css         # Component-scoped styles
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

### Reading records
Every time a file is successfully parsed, a `ReadingRecord` is saved to `localStorage` under the key `fastread_records`. Each record stores the file name, total word count, last word index, last read date, and WPM. When the same file is uploaded again, its saved `lastWordIndex` is automatically restored. Progress is also updated whenever reading is paused. Up to 20 records are kept (oldest are dropped). Records are displayed in a **Reading History** panel and can be individually deleted.

---

## Performance Considerations

- **No full-document preload:** PDFs are processed page-by-page using pdfjs-dist streaming API; EPUB chapters are loaded one at a time.
- **`React.memo` on ReaderViewport:** The word display only re-renders when the word changes, not on any other state update.
- **Refs in engine:** The RSVP engine interval callback reads the current word index via a ref (not closure) to avoid stale values without triggering re-renders.
- **`will-change: transform`** on the word element enables GPU compositing for the word-appear animation.

---

© 2025 TechScript Limited

