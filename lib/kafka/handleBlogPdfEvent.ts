import type { PdfExportJobData } from '@/lib/queue/pdfExportTypes';
import { generateServerPdf } from '@/lib/utils/serverPdfExport';
import { getPublicAppBaseUrl } from '@/lib/utils/exportRenderAuth';
import { isCloudinaryConfigured, uploadPdfToCloudinary } from '@/lib/utils/cloudinaryUpload';
import { blogEventToFormattedPages } from './blogEventToSections';
import { publishBlogPdfFailed, publishPdfReady } from './producer';
import { deleteRenderJob, saveRenderJob } from './renderJobStore';
import {
  NEWSLETTER_PDF_FAILED_EVENT,
  NEWSLETTER_PDF_READY_EVENT,
  type NewsletterPdfGenerateEvent,
} from './types';
import { resolveBlogTheme } from './types';

export async function handleBlogPdfEvent(event: NewsletterPdfGenerateEvent): Promise<void> {
  const jobId = event.eventId;
  const theme = resolveBlogTheme(event.theme);
  const dimensions = event.dimensions || 'a4';
  const bookTitle = event.title.trim() || 'Blog Post';

  console.log(`[kafka-blog] Processing blog ${event.blogId} (event ${jobId})`);

  const sections = blogEventToFormattedPages(event, theme);
  if (sections.length === 0) {
    throw new Error('No pages generated from blog content');
  }

  const jobData: PdfExportJobData = {
    sections,
    bookTitle,
    selectedTheme: theme,
    dimensions,
  };

  await saveRenderJob(jobId, jobData);

  try {
    const result = await generateServerPdf(jobId, {
      ...jobData,
      onProgress: async (progress, message) => {
        console.log(`[kafka-blog] ${jobId} ${progress}% — ${message}`);
      },
    });

    const baseUrl = getPublicAppBaseUrl().replace(/\/$/, '');
    const downloadUrl = isCloudinaryConfigured()
      ? await uploadPdfToCloudinary(result.filePath, jobId)
      : `${baseUrl}/api/blog-pdf/download/${jobId}`;

    if (isCloudinaryConfigured()) {
      console.log(`[kafka-blog] Uploaded ${jobId} to Cloudinary`);
    }

    await publishPdfReady({
      eventType: NEWSLETTER_PDF_READY_EVENT,
      eventId: jobId,
      blogId: event.blogId,
      filename: result.filename,
      pageCount: result.pageCount,
      downloadUrl,
      readyAt: new Date().toISOString(),
    });

    console.log(`[kafka-blog] PDF ready ${jobId} → URL producer will publish ${downloadUrl}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await publishBlogPdfFailed({
      eventType: NEWSLETTER_PDF_FAILED_EVENT,
      eventId: jobId,
      blogId: event.blogId,
      error: message,
      failedAt: new Date().toISOString(),
    });

    throw err;
  } finally {
    await deleteRenderJob(jobId).catch(() => {});
  }
}
