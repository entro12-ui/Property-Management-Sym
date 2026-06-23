import { prisma } from '@/lib/db';
import { extractReceiptFromImageBuffer, parseCbeReceiptText } from '@/lib/receipt-extraction';
import { isImageProof } from '@/lib/upload-utils';
import { resolveUploadBytes } from '@/lib/stored-files';

export async function extractPaymentProofData(proofId: string) {
  const proof = await prisma.invoicePaymentProof.findUniqueOrThrow({
    where: { id: proofId },
    select: {
      id: true,
      fileUrl: true,
      fileName: true,
      billingUrl: true,
      extractionStatus: true,
      extractedAmount: true,
    },
  });

  if (proof.extractionStatus === 'SUCCESS' && proof.extractedAmount != null) {
    return proof;
  }

  if (!proof.fileUrl || !isImageProof(proof.fileName, proof.fileUrl)) {
    await prisma.invoicePaymentProof.update({
      where: { id: proofId },
      data: { extractionStatus: 'FAILED' },
    });
    return null;
  }

  const file = await resolveUploadBytes(proof.fileUrl);
  if (!file) {
    await prisma.invoicePaymentProof.update({
      where: { id: proofId },
      data: { extractionStatus: 'FAILED' },
    });
    return null;
  }

  try {
    const extracted = await extractReceiptFromImageBuffer(file.buffer, file.mimeType);

    const hasData =
      extracted.amount != null ||
      extracted.payerName != null ||
      extracted.paymentDate != null ||
      extracted.transactionId != null;

    await prisma.invoicePaymentProof.update({
      where: { id: proofId },
      data: {
        extractedAmount: extracted.amount,
        extractedPayerName: extracted.payerName,
        extractedPaymentDate: extracted.paymentDate,
        extractedTransactionId: extracted.transactionId,
        extractedRawText: extracted.rawText || null,
        extractionStatus: hasData ? 'SUCCESS' : 'FAILED',
      },
    });

    return extracted;
  } catch {
    await prisma.invoicePaymentProof.update({
      where: { id: proofId },
      data: { extractionStatus: 'FAILED' },
    });
    return null;
  }
}

/** @deprecated Batch extraction – use reExtractPaymentProof per proof instead */
export async function extractPendingProofs(proofIds: string[]) {
  for (const id of proofIds) {
    try {
      await extractPaymentProofData(id);
    } catch {
      await prisma.invoicePaymentProof.update({
        where: { id },
        data: { extractionStatus: 'FAILED' },
      }).catch(() => {});
    }
  }
}

/** Test helper – parse known CBE receipt text without OCR. */
export function parseReceiptTextForTest(text: string) {
  return parseCbeReceiptText(text);
}
