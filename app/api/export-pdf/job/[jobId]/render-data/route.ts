import { NextResponse } from 'next/server';
import { getRenderJob } from '@/lib/kafka/renderJobStore';
import { getPdfExportQueue } from '@/lib/queue/pdfExportQueue';
import { isValidExportRenderToken } from '@/lib/utils/exportRenderAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!isValidExportRenderToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;

    let data = await getRenderJob(jobId);
    if (!data) {
      try {
        const queue = getPdfExportQueue();
        const job = await queue.getJob(jobId);
        data = job?.data ?? null;
      } catch {
        /* Redis optional — Kafka jobs use render-jobs filesystem store */
      }
    }

    if (!data) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({
      sections: data.sections,
      bookTitle: data.bookTitle,
      selectedTheme: data.selectedTheme,
      customThemeStyles: data.customThemeStyles,
      dimensions: data.dimensions || 'a4',
      pageCount: data.sections.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
