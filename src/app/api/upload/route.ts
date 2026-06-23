import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';
import {
  paymentProofExtension,
  validatePaymentProofFile,
  validateBuildingPhotoFile,
  buildingPhotoExtension,
} from '@/lib/upload-utils';
import { mimeTypeFromFileName, saveStoredFile } from '@/lib/stored-files';

const ALLOWED_TYPES = ['tenant-doc', 'receipt', 'expense', 'payment-proof', 'building-photo'] as const;

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'tenant-doc';

    if (!file || !ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json({ error: 'Missing file or invalid type' }, { status: 400 });
    }

    if (type === 'payment-proof') {
      const validationError = validatePaymentProofFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    if (type === 'building-photo') {
      const validationError = validateBuildingPhotoFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    const ext =
      type === 'payment-proof'
        ? paymentProofExtension(file)
        : type === 'building-photo'
          ? buildingPhotoExtension(file)
          : file.name.includes('.')
            ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
            : '.pdf';

    const safeBase = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 80);
    const fileName = file.name || `${safeBase}${ext}`;
    const mimeType = file.type || mimeTypeFromFileName(fileName);
    const bytes = await file.arrayBuffer();
    const stored = await saveStoredFile(Buffer.from(bytes), fileName, mimeType);

    return NextResponse.json({ url: stored.url, fileName: stored.fileName });
  } catch (e) {
    logger.error('File upload failed', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
