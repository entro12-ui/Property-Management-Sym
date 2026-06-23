import { NextRequest, NextResponse } from 'next/server';
import { serveUploadByPathSegments } from '@/lib/stored-files';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const response = await serveUploadByPathSegments(segments ?? []);
  if (!response) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return response;
}
