import type { PdfExportJobData } from '@/lib/queue/pdfExportTypes';
import { generateServerPdf } from '@/lib/utils/serverPdfExport';
import { getPublicAppBaseUrl } from '@/lib/utils/exportRenderAuth';
import { isCloudinaryConfigured, uploadPdfToCloudinary } from '@/lib/utils/cloudinaryUpload';
import { publishBlogPdfReady } from './producer';
import { blogEventToFormattedPages } from './blogEventToSections';
import type { BlogBatchDelivery, BlogBatchRequestEvent } from './blogServiceTypes';
import { BLOG_PDF_READY_EVENT } from './blogServiceTypes';
import { deleteRenderJob, saveRenderJob } from './renderJobStore';
import type { ThemeId } from '@/lib/themes/types';
import { VALID_THEME_IDS } from './types';

function resolveThemeFromTone(tone?: string): ThemeId {
  if (tone && VALID_THEME_IDS.includes(tone as ThemeId)) return tone as ThemeId;
  return 'editorial';
}

async function processDelivery(
  runId: string,
  delivery: BlogBatchDelivery
): Promise<void> {
  const jobId = delivery.deliveryId;
  const { article, subscriber } = delivery;
  const theme = resolveThemeFromTone(subscriber.preferredTone);

  console.log(
    `[kafka-blog-service] PDF for delivery ${jobId} article ${article.convertedArticleId}`
  );

  const sections = blogEventToFormattedPages(
    {
      eventType: 'NEWS_LETTER_PDF',
      eventId: jobId,
      blogId: article.convertedArticleId,
      title: article.title,
      author: `${subscriber.firstName} ${subscriber.lastName}`.trim(),
      content: article.contentText,
      theme,
      dimensions: 'a4',
    },
    theme
  );

  const jobData: PdfExportJobData = {
    sections,
    bookTitle: article.title,
    selectedTheme: theme,
    dimensions: 'a4',
  };

  await saveRenderJob(jobId, jobData);

  try {
    const result = await generateServerPdf(jobId, {
      ...jobData,
      onProgress: async (progress, message) => {
        console.log(`[kafka-blog-service] ${jobId} ${progress}% — ${message}`);
      },
    });

    const baseUrl = getPublicAppBaseUrl().replace(/\/$/, '');
    const downloadUrl = isCloudinaryConfigured()
      ? await uploadPdfToCloudinary(result.filePath, jobId)
      : `${baseUrl}/api/blog-pdf/download/${jobId}`;

    await publishBlogPdfReady({
      schemaVersion: 1,
      eventType: BLOG_PDF_READY_EVENT,
      deliveryId: delivery.deliveryId,
      runId,
      emittedAt: new Date().toISOString(),
      subscriber: {
        userId: subscriber.userId,
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
      },
      article: {
        convertedArticleId: article.convertedArticleId,
        sourceArticleId: article.sourceArticleId,
        title: article.title,
      },
      pdf: {
        url: downloadUrl,
        contentType: 'application/pdf',
      },
    });

    console.log(`[kafka-blog-service] Sent pdf.ready ${jobId} → ${downloadUrl}`);
  } finally {
    await deleteRenderJob(jobId).catch(() => {});
  }
}

export async function handleBlogBatchEvent(event: BlogBatchRequestEvent): Promise<void> {
  console.log(
    `[kafka-blog-service] Batch ${event.eventId} run ${event.runId} — ${event.deliveries.length} deliveries`
  );

  for (const delivery of event.deliveries) {
    try {
      await processDelivery(event.runId, delivery);
    } catch (err) {
      console.error(
        `[kafka-blog-service] Failed delivery ${delivery.deliveryId}:`,
        err instanceof Error ? err.message : err
      );
    }
  }
}
