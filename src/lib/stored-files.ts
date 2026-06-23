import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';
import { getUploadDir } from '@/lib/upload-storage';

export const STORED_FILE_URL_PREFIX = '/api/files/db/';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export function storedFileUrl(id: string): string {
  return `${STORED_FILE_URL_PREFIX}${id}`;
}

export function storedFileIdFromUrl(url: string): string | null {
  if (!url.startsWith(STORED_FILE_URL_PREFIX)) return null;
  const id = url.slice(STORED_FILE_URL_PREFIX.length).split('/')[0];
  return id || null;
}

export function isStoredFileUrl(url: string): boolean {
  return url.startsWith(STORED_FILE_URL_PREFIX);
}

export function isValidUploadUrl(url: string): boolean {
  return (
    isStoredFileUrl(url) ||
    url.startsWith('/uploads/') ||
    url.startsWith('/api/files/')
  );
}

export function mimeTypeFromFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

export async function saveStoredFile(
  data: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ id: string; url: string; fileName: string }> {
  const file = await prisma.storedFile.create({
    data: { fileName, mimeType, data: new Uint8Array(data) },
  });
  return { id: file.id, url: storedFileUrl(file.id), fileName: file.fileName };
}

export async function readStoredFileRecord(id: string) {
  return prisma.storedFile.findUnique({ where: { id } });
}

/** Load file bytes from database storage or legacy on-disk upload paths. */
export async function resolveUploadBytes(
  fileUrl: string
): Promise<{ buffer: Buffer; mimeType: string; fileName?: string } | null> {
  const storedId = storedFileIdFromUrl(fileUrl);
  if (storedId) {
    const file = await readStoredFileRecord(storedId);
    if (!file) return null;
    return {
      buffer: Buffer.from(file.data),
      mimeType: file.mimeType,
      fileName: file.fileName,
    };
  }

  let relativePath: string | null = null;
  if (fileUrl.startsWith('/uploads/')) {
    relativePath = fileUrl.slice('/uploads/'.length);
  } else if (fileUrl.startsWith('/api/files/') && !fileUrl.startsWith(STORED_FILE_URL_PREFIX)) {
    relativePath = fileUrl.slice('/api/files/'.length);
  }

  if (!relativePath) return null;

  const diskPath = path.join(getUploadDir(), ...relativePath.split('/'));
  const uploadRoot = path.resolve(getUploadDir());
  const resolved = path.resolve(diskPath);
  if (!resolved.startsWith(uploadRoot + path.sep) && resolved !== uploadRoot) {
    return null;
  }

  try {
    const buffer = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    return {
      buffer,
      mimeType: MIME_BY_EXT[ext] ?? 'application/octet-stream',
      fileName: path.basename(resolved),
    };
  } catch {
    return null;
  }
}

export async function serveUploadResponse(fileUrl: string): Promise<Response | null> {
  const file = await resolveUploadBytes(fileUrl);
  if (!file) return null;

  return new Response(new Uint8Array(file.buffer), {
    headers: {
      'Content-Type': file.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function serveUploadByPathSegments(segments: string[]): Promise<Response | null> {
  if (!segments.length) return null;

  if (segments[0] === 'db' && segments.length === 2) {
    return serveUploadResponse(storedFileUrl(segments[1]));
  }

  return serveUploadResponse(`/uploads/${segments.join('/')}`);
}
