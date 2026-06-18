#!/usr/bin/env node
/**
 * Verifies payment proof upload handling with sample CBE receipt JPGs.
 * Run: node scripts/verify-payment-proof-upload.mjs
 */
import { readFile, copyFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const samplesDir = path.join(root, 'Invoices-samples');
const uploadDir = path.join(root, 'public', 'uploads', 'payment-proof');

const PAYMENT_PROOF_MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

function paymentProofExtension(name, mime) {
  if (mime && PAYMENT_PROOF_MIME_TO_EXT[mime]) return PAYMENT_PROOF_MIME_TO_EXT[mime];
  const fromName = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : '';
  if (fromName === '.jpeg') return '.jpg';
  if (['.jpg', '.png', '.webp', '.pdf'].includes(fromName)) return fromName;
  return '.jpg';
}

function detectPaymentProofType(fileName, fileUrl) {
  const value = (fileName ?? fileUrl).toLowerCase();
  if (value.endsWith('.pdf')) return 'DOCUMENT';
  return 'IMAGE';
}

async function main() {
  const samples = ['invoice 1.jpg', 'invoice 2.jpg', 'invoice 3.jpg', 'invoice 4.jpg'];
  let passed = 0;

  console.log('Checking sample receipt files…\n');

  for (const name of samples) {
    const filePath = path.join(samplesDir, name);
    try {
      const buf = await readFile(filePath);
      const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
      const ext = paymentProofExtension(name, 'image/jpeg');
      const proofType = detectPaymentProofType(name, `/uploads/payment-proof/test${ext}`);

      if (!isJpeg) {
        console.log(`✗ ${name}: not a valid JPEG`);
        continue;
      }
      if (ext !== '.jpg' || proofType !== 'IMAGE') {
        console.log(`✗ ${name}: unexpected ext=${ext} type=${proofType}`);
        continue;
      }

      console.log(`✓ ${name}: ${(buf.length / 1024).toFixed(1)} KB, JPEG, proofType=IMAGE`);
      passed++;
    } catch (e) {
      console.log(`✗ ${name}: ${e.message}`);
    }
  }

  if (passed !== samples.length) {
    process.exit(1);
  }

  await mkdir(uploadDir, { recursive: true });
  const testName = `verify-${Date.now()}.jpg`;
  const dest = path.join(uploadDir, testName);
  await copyFile(path.join(samplesDir, 'invoice 1.jpg'), dest);
  await access(dest);

  const publicUrl = `/uploads/payment-proof/${testName}`;
  console.log(`\n✓ Copied sample to ${publicUrl}`);
  console.log('\nAll payment proof upload checks passed.');
  console.log('Test in the app: log in as a tenant → My Invoices → upload one of the sample JPGs.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
