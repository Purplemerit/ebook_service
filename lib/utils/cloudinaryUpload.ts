import { unlink } from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';

function getCloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();
  return { cloud_name, api_key, api_secret };
}

export function isCloudinaryConfigured(): boolean {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  return Boolean(cloud_name && api_key && api_secret);
}

function ensureCloudinaryConfigured(): void {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }
}

/** Upload a generated PDF and return its public HTTPS URL. */
export async function uploadPdfToCloudinary(
  filePath: string,
  publicId: string
): Promise<string> {
  ensureCloudinaryConfigured();

  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  cloudinary.config({ cloud_name, api_key, api_secret });

  const folder = process.env.CLOUDINARY_PDF_FOLDER?.trim() || 'newsletter-pdfs';
  const safeId = publicId.replace(/[^\w\-]+/g, '_');

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder,
    public_id: safeId,
    overwrite: true,
    access_mode: 'public',
  });

  if (!result.secure_url) {
    throw new Error('Cloudinary upload succeeded but no secure_url was returned');
  }

  await unlink(filePath).catch(() => {});

  return result.secure_url;
}
