export function getExportRenderSecret(): string {
  return process.env.EXPORT_RENDER_SECRET || 'dev-export-render-secret';
}

export function isValidExportRenderToken(token: string | null | undefined): boolean {
  return Boolean(token && token === getExportRenderSecret());
}

export function getAppBaseUrl(): string {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
}

/** Public URL for download links sent to external services (may differ from internal APP_URL in Docker). */
export function getPublicAppBaseUrl(): string {
  return process.env.PUBLIC_APP_URL || getAppBaseUrl();
}

export function buildExportRenderUrl(jobId: string): string {
  const base = getAppBaseUrl().replace(/\/$/, '');
  const token = encodeURIComponent(getExportRenderSecret());
  return `${base}/export-render?jobId=${encodeURIComponent(jobId)}&token=${token}`;
}
