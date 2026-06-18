const PAYMENT_PROOF_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export const PAYMENT_PROOF_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf';

export const BUILDING_PHOTO_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export function validatePaymentProofFile(file: File): string | null {
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) return 'File is too large. Maximum size is 10 MB.';

  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const allowedMime = Object.keys(PAYMENT_PROOF_MIME_TO_EXT);
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

  const mimeOk = mime && allowedMime.includes(mime);
  const extOk = allowedExt.some((ext) => name.endsWith(ext));

  if (!mimeOk && !extOk) {
    return 'Please upload a JPG, PNG, WEBP, or PDF receipt (e.g. mobile banking screenshot).';
  }

  return null;
}

export function paymentProofExtension(file: File): string {
  const mime = file.type.toLowerCase();
  if (mime && PAYMENT_PROOF_MIME_TO_EXT[mime]) {
    return PAYMENT_PROOF_MIME_TO_EXT[mime];
  }

  const fromName = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
  if (fromName === '.jpeg') return '.jpg';
  if (['.jpg', '.png', '.webp', '.pdf'].includes(fromName)) return fromName;

  return '.jpg';
}

export function detectPaymentProofType(fileName: string | null, fileUrl: string): 'IMAGE' | 'DOCUMENT' {
  const value = (fileName ?? fileUrl).toLowerCase();
  if (value.endsWith('.pdf')) return 'DOCUMENT';
  return 'IMAGE';
}

export function validateBuildingPhotoFile(file: File): string | null {
  return validatePaymentProofFile(file);
}

export function buildingPhotoExtension(file: File): string {
  return paymentProofExtension(file);
}

export function isImageProofUrl(url: string): boolean {
  return /\.(jpe?g|png|webp)(\?|$)/i.test(url);
}
