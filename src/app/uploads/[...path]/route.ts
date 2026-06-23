import { NextRequest, NextResponse } from 'next/server';
import { serveUploadByPathSegments } from '@/lib/stored-files';

/** Legacy URL support: /uploads/payment-proof/... (disk files from before DB storage). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const response = await serveUploadByPathSegments(segments ?? []);
  if (!response) {
    return NextResponse.json(
      { error: 'File not found. It may have been lost during a server redeploy — please re-upload.' },
      { status: 404 }
    );
  }
  return response;
}
