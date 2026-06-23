import path from 'path';

/** Base directory for uploaded files. Set UPLOAD_DIR on Render with a persistent disk mount. */
export function getUploadDir(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'public', 'uploads');
}

/** Public URL path for a stored upload. Uses /api/files when UPLOAD_DIR is set (persistent disk). */
export function getUploadUrl(type: string, filename: string): string {
  if (process.env.UPLOAD_DIR) {
    return `/api/files/${type}/${filename}`;
  }
  return `/uploads/${type}/${filename}`;
}
