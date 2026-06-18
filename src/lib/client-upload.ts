export async function uploadPaymentProofFile(
  file: File
): Promise<{ url: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'payment-proof');

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = (await res.json()) as { url?: string; fileName?: string; error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? 'Upload failed. Please try again.');
  }
  if (!data.url) {
    throw new Error('Upload failed. Please try again.');
  }

  return { url: data.url, fileName: data.fileName ?? file.name };
}
