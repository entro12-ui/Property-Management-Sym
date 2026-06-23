import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/logger';
import { getUploadDir, getUploadUrl } from '@/lib/upload-storage';
import {
  paymentProofExtension,
  validatePaymentProofFile,
  validateBuildingPhotoFile,
  buildingPhotoExtension,
} from '@/lib/upload-utils';
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

    const dir = path.join(getUploadDir(), type);
    await mkdir(dir, { recursive: true });

    const ext =
      type === 'payment-proof'
        ? paymentProofExtension(file)
        : type === 'building-photo'
          ? buildingPhotoExtension(file)
          : path.extname(file.name) || '.pdf';

    const safeBase = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 80);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(dir, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = getUploadUrl(type, name);
    return NextResponse.json({ url, fileName: file.name || safeBase });
  } catch (e) {
    logger.error('File upload failed', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
