/**
 * epubParser
 *
 * Extracts text from an EPUB File using epubjs.
 * Chapters are processed sequentially; HTML tags, images and styling are
 * stripped leaving only plain readable text.
 *
 * Architecture note: epubjs needs a DOM environment (present in browsers) and
 * a URL for the zip blob. We create an object URL from the File, pass it to
 * ePub(), then walk the spine in order.
 */

import ePub from 'epubjs';

export interface ParseProgress {
  chaptersProcessed: number;
  totalChapters: number;
  percent: number;
}

/** Strip HTML tags from a string, collapsing block-level tags to spaces */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(p|div|h[1-6]|li|tr|td|th|blockquote|section|article)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Async generator that yields one chapter's worth of plain text at a time.
 */
export async function* parseEPUB(
  file: File,
  onProgress?: (p: ParseProgress) => void,
): AsyncGenerator<string, void, unknown> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const book = ePub(objectUrl);
    await book.ready;

    // spine items represent chapters in reading order
    const spineItems: unknown[] = [];
    book.spine.each((item: unknown) => spineItems.push(item));
    const totalChapters = spineItems.length;

    for (let i = 0; i < spineItems.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spineItem = spineItems[i] as any;
      try {
        const doc = await book.load(spineItem.href);
        // doc is a Document node; serialize to HTML then strip tags
        const bodyHtml =
          (doc as Document).body?.innerHTML ?? String(doc);
        const text = stripHtml(bodyHtml);

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

    book.destroy();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
