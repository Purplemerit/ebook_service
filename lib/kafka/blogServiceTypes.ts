/** Matches blog_service NewsletterBatchRequestEvent / NewsletterPdfReadyEvent. */

export const BLOG_BATCH_REQUEST_EVENT = 'newsletter.batch.request' as const;
export const BLOG_PDF_READY_EVENT = 'newsletter.pdf.ready' as const;

export interface BlogNewsletterArticle {
  convertedArticleId: string;
  sourceArticleId: string;
  toneApplied: string;
  topic: string;
  title: string;
  contentText: string;
  publishedAt: string | null;
  sourceUrl: string;
}

export interface BlogBatchDelivery {
  deliveryId: string;
  subscriber: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    preferredTone: string;
    preferredTopics: string[];
  };
  article: BlogNewsletterArticle;
}

export interface BlogBatchRequestEvent {
  schemaVersion: 2;
  eventType: typeof BLOG_BATCH_REQUEST_EVENT;
  eventId: string;
  runId: string;
  emittedAt: string;
  deliveryCount: number;
  deliveries: BlogBatchDelivery[];
  meta: {
    appName: string;
    appBaseUrl: string;
  };
}

export interface BlogPdfReadyEvent {
  schemaVersion: 1;
  eventType: typeof BLOG_PDF_READY_EVENT;
  deliveryId: string;
  runId: string;
  emittedAt: string;
  subscriber: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  article: {
    convertedArticleId: string;
    sourceArticleId: string;
    title: string;
  };
  pdf: {
    url: string;
    contentType: string;
  };
}

export function isBlogBatchRequestEvent(value: unknown): value is BlogBatchRequestEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    e.eventType === BLOG_BATCH_REQUEST_EVENT &&
    e.schemaVersion === 2 &&
    typeof e.runId === 'string' &&
    Array.isArray(e.deliveries)
  );
}
