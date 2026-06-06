import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { EbookSection } from './pdfParser';
import type { ThemeId } from '../themes/types';
import {
  cacheExportImageDataUrl,
  clearExportImageCache,
  getExportSafeImageUrl,
  getPlaceholderImageUrl,
  getStockFallbackUrl,
  getThemeImageSlotsForPage,
} from './imageHelper';

/** Threshold above which preview renders one page at a time (avoids browser freeze). */
export const LARGE_BOOK_PAGE_THRESHOLD = 15;

interface CaptureSettings {
  scale: number;
  quality: number;
  imageWaitMs: number;
  pageTimeoutMs: number;
  yieldMs: number;
}

function getCaptureSettings(totalPages: number): CaptureSettings {
  if (totalPages > 100) {
    return { scale: 0.72, quality: 0.76, imageWaitMs: 300, pageTimeoutMs: 22_000, yieldMs: 2 };
  }
  if (totalPages > 30) {
    return { scale: 0.8, quality: 0.8, imageWaitMs: 500, pageTimeoutMs: 28_000, yieldMs: 4 };
  }
  return { scale: 1, quality: 0.85, imageWaitMs: 1200, pageTimeoutMs: 40_000, yieldMs: 12 };
}

/** Rough export ETA shown in the confirm dialog. */
export function estimateExportMinutes(totalPages: number): number {
  if (totalPages > 100) return Math.max(5, Math.round(totalPages * 0.045));
  if (totalPages > 30) return Math.max(3, Math.round(totalPages * 0.07));
  return Math.max(1, Math.round(totalPages * 0.15));
}

/** Make the export container paintable — must stay in the viewport (no off-screen transform). */
export function prepareElementForPdfCapture(element: HTMLElement): () => void {
  const wrapper = element.parentElement as HTMLElement | null;
  const prevWrapperStyle = wrapper?.getAttribute('style') ?? '';
  const prevElementStyle = element.getAttribute('style') ?? '';
  const prevWrapperAria = wrapper?.getAttribute('aria-hidden') ?? null;

  if (wrapper) {
    wrapper.removeAttribute('aria-hidden');
    wrapper.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'width:595px',
      'z-index:9000',
      'pointer-events:none',
      'overflow:visible',
      'opacity:1',
      'visibility:visible',
    ].join(';');
  }

  element.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'width:595px',
    'background:#fff',
  ].join(';');

  return () => {
    if (wrapper) {
      if (prevWrapperStyle) wrapper.setAttribute('style', prevWrapperStyle);
      else wrapper.removeAttribute('style');
      if (prevWrapperAria !== null) wrapper.setAttribute('aria-hidden', prevWrapperAria);
      else wrapper.setAttribute('aria-hidden', 'true');
    }
    if (prevElementStyle) element.setAttribute('style', prevElementStyle);
    else element.removeAttribute('style');
  };
}

export async function waitForNextPaint(): Promise<void> {
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
}

/** Yield to the browser so the tab stays responsive during long exports. */
export function yieldToBrowser(ms = 16): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/** Poll until the export page is mounted and laid out with real dimensions. */
export async function waitForPageElement(
  getPageElement: () => HTMLElement | null,
  timeoutMs = 6000
): Promise<HTMLElement> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const el = getPageElement();
    if (el && el.offsetWidth >= 400 && el.offsetHeight >= 400) {
      return el;
    }
    await yieldToBrowser(20);
  }
  throw new Error('Export page element not ready — try again.');
}

/** Wait until images inside the export root have loaded (or time out). */
export function waitForExportImages(root: HTMLElement, timeoutMs = 500): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  const pending = images.filter((img) => !img.complete || img.naturalWidth === 0);
  if (pending.length === 0) return Promise.resolve();

  return Promise.race([
    Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
              return;
            }
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          })
      )
    ).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

/** Downscale and embed as JPEG data URL — instant paint during html2canvas. */
async function toExportDataUrl(url: string, maxWidth = 520): Promise<string> {
  if (url.startsWith('data:')) return url;

  try {
    const img = await loadImageElement(url);
    const scale = Math.min(maxWidth / img.naturalWidth, maxWidth / img.naturalHeight, 1);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return url;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.78);
  } catch {
    return getPlaceholderImageUrl('image', 0);
  }
}

interface ImageSlotRef {
  prompt: string;
  seed: number;
}

function collectExportImageSlots(
  sections: EbookSection[],
  bookTitle: string,
  themeId: ThemeId
): ImageSlotRef[] {
  const seen = new Set<string>();
  const slots: ImageSlotRef[] = [];

  const add = (prompt: string, seed: number) => {
    const key = `${seed}::${prompt}`;
    if (seen.has(key)) return;
    seen.add(key);
    slots.push({ prompt, seed });
  };

  sections.forEach((section, index) => {
    const pageIndex = index + 1;
    const chapterTitle = section.chapterTitle || section.title;
    const themeSlots = getThemeImageSlotsForPage(themeId, chapterTitle, bookTitle, pageIndex);
    add(themeSlots.primary.prompt, themeSlots.primary.seed);
    themeSlots.extras.forEach((slot) => add(slot.prompt, slot.seed));
    add(section.imagePrompt || chapterTitle, pageIndex);
  });

  return slots;
}

/** Convert all export images to embedded data URLs before capture. */
export async function preloadExportImages(
  sections: EbookSection[],
  bookTitle: string,
  themeId: ThemeId,
  onPreloadProgress?: (loaded: number, total: number) => void
): Promise<void> {
  clearExportImageCache();
  const slots = collectExportImageSlots(sections, bookTitle, themeId);
  const batchSize = 32;
  let loaded = 0;

  for (let i = 0; i < slots.length; i += batchSize) {
    await Promise.all(
      slots.slice(i, i + batchSize).map(async ({ prompt, seed }) => {
        const sourceUrl = getExportSafeImageUrl(prompt, seed);
        const compactUrl = sourceUrl.includes('picsum.photos')
          ? getStockFallbackUrl(prompt, seed, 520, 390)
          : sourceUrl;
        const dataUrl = await toExportDataUrl(compactUrl);
        cacheExportImageDataUrl(prompt, seed, dataUrl);
        loaded++;
        onPreloadProgress?.(loaded, slots.length);
      })
    );
    await yieldToBrowser(0);
  }
}

function triggerPdfDownload(doc: jsPDF, filename: string): void {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function canvasToJpegDataUrl(canvas: HTMLCanvasElement, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas encoding failed'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Canvas read failed'));
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

export interface PageByPageExportOptions {
  totalPages: number;
  filename: string;
  onRenderPage: (pageIndex: number) => void | Promise<void>;
  onProgress?: (current: number, total: number) => void;
  getPageElement: () => HTMLElement | null;
  signal?: AbortSignal;
}

async function capturePageElement(
  pageEl: HTMLElement,
  pageNum: number,
  settings: CaptureSettings
): Promise<string> {
  const canvas = await withTimeout(
    html2canvas(pageEl, {
      scale: settings.scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: pageEl.offsetWidth,
      height: pageEl.offsetHeight,
      windowWidth: pageEl.offsetWidth,
      windowHeight: pageEl.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 5000,
      onclone: (clonedDoc, clonedPage) => {
        clonedDoc.querySelectorAll('.no-print').forEach((node) => {
          (node as HTMLElement).style.display = 'none';
        });
        (clonedPage as HTMLElement).style.boxShadow = 'none';
        (clonedPage as HTMLElement).style.transform = 'none';
      },
    }),
    settings.pageTimeoutMs,
    `Page ${pageNum} capture`
  );

  if (canvas.width < 10 || canvas.height < 10) {
    throw new Error(`Page ${pageNum} capture produced an empty canvas`);
  }

  return canvasToJpegDataUrl(canvas, settings.quality);
}

/**
 * Export styled pages one at a time — matches the preview design (themes, images, layout).
 */
export async function exportStyledEbookPdf(options: PageByPageExportOptions): Promise<void> {
  const { totalPages, filename, onRenderPage, onProgress, getPageElement, signal } = options;
  const settings = getCaptureSettings(totalPages);

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  let failedPages = 0;
  let isFirstPage = true;

  for (let i = 0; i < totalPages; i++) {
    if (signal?.aborted) {
      throw new Error('Export cancelled.');
    }

    onProgress?.(i + 1, totalPages);

    let imgData: string | null = null;

    try {
      await onRenderPage(i);
      await waitForNextPaint();
      await waitForNextPaint();
      await yieldToBrowser(Math.max(settings.yieldMs, 80));

      const pageEl = await waitForPageElement(getPageElement);
      await waitForExportImages(pageEl, settings.imageWaitMs);
      imgData = await capturePageElement(pageEl, i + 1, settings);
    } catch (pageErr) {
      failedPages++;
      console.warn(`PDF export skipped page ${i + 1}:`, pageErr);
    }

    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    if (imgData) {
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    } else {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`Page ${i + 1}`, 20, 30);
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('This page could not be rendered — re-export to retry.', 20, 42);
    }

    if (i % 4 === 0) {
      await yieldToBrowser(0);
    }
  }

  triggerPdfDownload(doc, filename);
  clearExportImageCache();

  if (failedPages > 0) {
    console.warn(`PDF export finished with ${failedPages} page(s) using fallback placeholders.`);
  }
}

/** @deprecated Use exportStyledEbookPdf */
export const exportEbookPageByPage = exportStyledEbookPdf;
