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

/** Upload a generated PDF and return a signed public HTTPS URL. */
export async function uploadPdfToCloudinary(
  filePath: string,
  publicId: string
): Promise<string> {
  ensureCloudinaryConfigured();

  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  cloudinary.config({ cloud_name, api_key, api_secret });

  const folder = process.env.CLOUDINARY_PDF_FOLDER?.trim() || 'newsletter-pdfs';
  const safeId = publicId.replace(/[^\w\-]+/g, '_');

  // PDFs deliver more reliably as "image" assets than "raw" on most Cloudinary accounts.
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'image',
    folder,
    public_id: safeId,
    overwrite: true,
    access_mode: 'public',
  });

  if (!result.public_id) {
    throw new Error('Cloudinary upload succeeded but no public_id was returned');
  }

  await unlink(filePath).catch(() => {});

  const signedUrl = cloudinary.url(result.public_id, {
    resource_type: 'image',
    type: 'upload',
    format: 'pdf',
    sign_url: true,
    secure: true,
  });

  console.log(`[cloudinary] Saved ${result.public_id} → ${signedUrl}`);

  return signedUrl;
}
