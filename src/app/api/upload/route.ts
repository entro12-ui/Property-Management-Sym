import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['tenant-doc', 'receipt', 'expense'] as const;

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

    const dir = path.join(UPLOAD_DIR, type);
    await mkdir(dir, { recursive: true });
    const ext = path.extname(file.name) || '.pdf';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(dir, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/${type}/${name}`;
    return NextResponse.json({ url });
  } catch (e) {
    logger.error('File upload failed', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
