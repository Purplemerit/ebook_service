import type { ThemeId } from '@/lib/themes/types';

export const NEWSLETTER_PDF_EVENT = 'NEWS_LETTER_PDF' as const;
export const NEWSLETTER_PDF_COMPLETED_EVENT = 'NEWS_LETTER_PDF_COMPLETED' as const;
export const NEWSLETTER_PDF_FAILED_EVENT = 'NEWS_LETTER_PDF_FAILED' as const;

/** Event published by blog_service / newsletter service to request a PDF. */
export interface NewsletterPdfGenerateEvent {
  eventType: typeof NEWSLETTER_PDF_EVENT;
  /** Unique id for this export request (used as job id + filename key). */
  eventId: string;
  /** Content id in the upstream service (blog/newsletter id). */
  blogId: string;
  title: string;
  author?: string;
  /** HTML or plain text body. */
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  theme?: ThemeId;
  dimensions?: 'letter' | 'a4' | 'legal';
  requestedAt?: string;
}

/** @deprecated Alias for NewsletterPdfGenerateEvent */
export type BlogPdfGenerateEvent = NewsletterPdfGenerateEvent;

export interface NewsletterPdfCompletedEvent {
  eventType: typeof NEWSLETTER_PDF_COMPLETED_EVENT;
  eventId: string;
  blogId: string;
  filename: string;
  pageCount: number;
  downloadUrl: string;
  completedAt: string;
}

/** @deprecated Alias */
export type BlogPdfCompletedEvent = NewsletterPdfCompletedEvent;

export interface NewsletterPdfFailedEvent {
  eventType: typeof NEWSLETTER_PDF_FAILED_EVENT;
  eventId: string;
  blogId: string;
  error: string;
  failedAt: string;
}

/** @deprecated Alias */
export type BlogPdfFailedEvent = NewsletterPdfFailedEvent;

export function isNewsletterPdfGenerateEvent(value: unknown): value is NewsletterPdfGenerateEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    e.eventType === NEWSLETTER_PDF_EVENT &&
    typeof e.eventId === 'string' &&
    typeof e.blogId === 'string' &&
    typeof e.title === 'string' &&
    typeof e.content === 'string'
  );
}

/** @deprecated */
export const isBlogPdfGenerateEvent = isNewsletterPdfGenerateEvent;

export const VALID_THEME_IDS: ThemeId[] = [
  'editorial',
  'botanical',
  'modern',
  'noir',
  'wanderlust',
  'softpink',
  'comic',
  'sporty',
  'wellness',
  'newspaper',
  'bloodred',
  'minimalblack',
  'rose',
  'lavender',
  'bolddark',
];

export function resolveBlogTheme(theme?: string): ThemeId {
  if (!theme) return 'editorial';
  if (VALID_THEME_IDS.includes(theme as ThemeId)) return theme as ThemeId;
  throw new Error(
    `Unknown theme "${theme}". Available: ${VALID_THEME_IDS.join(', ')}`
  );
}
