/**
 * epubParser
 *
 * Extracts text from an EPUB File using epubjs.
 * Chapters are processed sequentially; HTML tags, images and styling are
 * stripped leaving only plain readable text.
 *
 * Architecture note: epubjs needs a DOM environment (present in browsers).
 * We read the File as an ArrayBuffer and pass it directly to ePub() so that
 * epubjs classifies it as INPUT_TYPE.BINARY, sets archived=true, and reads
 * every chapter from the in-memory zip without any network request.
 *
 * Using URL.createObjectURL() causes epubjs to classify the blob URL as
 * INPUT_TYPE.DIRECTORY (the UUID path has no file extension), which makes
 * it attempt an XHR to "null/META-INF/container.xml" — a request that hangs
 * indefinitely, leaving the app stuck in the loading state.
 */

import ePub from 'epubjs';

export interface ParseProgress {
  chaptersProcessed: number;
  totalChapters: number;
  percent: number;
}

/**
 * Async generator that yields one chapter's worth of plain text at a time.
 */
export async function* parseEPUB(
  file: File,
  onProgress?: (p: ParseProgress) => void,
): AsyncGenerator<string, void, unknown> {
  // Read the entire file into memory once; epubjs treats a non-string input as
  // INPUT_TYPE.BINARY which correctly unzips the epub from the ArrayBuffer.
  const arrayBuffer = await file.arrayBuffer();

  let book: ReturnType<typeof ePub> | undefined;
  try {
    book = ePub(arrayBuffer);
    await book.ready;
    // spine items represent chapters in reading order
    const spineItems: unknown[] = [];
    book.spine.each((item: unknown) => spineItems.push(item));
    const totalChapters = spineItems.length;

    for (let i = 0; i < spineItems.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spineItem = spineItems[i] as any;
      try {
        // Load the section: passes book.load as the request function so that
        // epubjs fetches the chapter from the in-memory archive and parses it
        // into a Document stored at spineItem.document.
        await spineItem.load(book.load.bind(book));

        const doc = spineItem.document as Document | null | undefined;
        // XMLDocument (parsed from application/xhtml+xml) may not expose
        // .body on all browsers — fall back to querySelector then documentElement.
        const bodyEl: Element | null =
          doc?.body ??
          (doc as Document | null | undefined)?.querySelector?.('body') ??
          doc?.documentElement ??
          null;
        // textContent strips all HTML tags natively — no regex needed.
        const text = bodyEl?.textContent ?? '';
        spineItem.unload();

        if (onProgress) {
          onProgress({
            chaptersProcessed: i + 1,
            totalChapters,
            percent: Math.round(((i + 1) / totalChapters) * 100),
          });
        }

        yield text;
      } catch {
        // Skip unreadable chapters (e.g., NCX, cover images)
      }
    }
  } finally {
    book?.destroy();
  }
}
