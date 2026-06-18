export type ExtractedReceiptData = {
  amount: number | null;
  payerName: string | null;
  paymentDate: Date | null;
  transactionId: string | null;
  rawText: string;
};

function parseAmount(value: string): number | null {
  const n = parseFloat(value.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parseReceiptDate(value: string): Date | null {
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return null;
  const [, day, mon, year] = match;
  const parsed = new Date(`${day} ${mon} ${year} 12:00:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeName(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

function extractPayerName(normalized: string): string | null {
  const dear = normalized.match(/Dear\s+([A-Z][A-Z\s]+?)(?:,|\.|\s+ETB)/i);
  if (dear) return normalizeName(dear[1]);

  const debitedFrom = normalized.match(/debited from\s+([A-Z][A-Z\s]+?)\s+for/i);
  if (debitedFrom && !/^your account$/i.test(debitedFrom[1].trim())) {
    return normalizeName(debitedFrom[1]);
  }

  return null;
}

/** Parse CBE mobile banking receipt text (Commercial Bank of Ethiopia). */
export function parseCbeReceiptText(text: string): ExtractedReceiptData {
  const normalized = text.replace(/\s+/g, ' ').trim();

  const totalAmountMatch = normalized.match(
    /Total Amount Debited\s+ETB\s+([\d,]+\.?\d*)/i
  );
  const debitedAmountMatch = normalized.match(
    /ETB\s+([\d,]+\.?\d*)\s+(?:has been )?debited/i
  );

  const dateMatch = normalized.match(/\bon\s+(\d{1,2}-[A-Za-z]{3}-\d{4})\b/i);
  const txnMatch =
    normalized.match(/Transaction ID[:\s]+([A-Z0-9]+)/i) ??
    normalized.match(/transaction ID[:\s]+([A-Z0-9]+)/i);

  const amount = totalAmountMatch
    ? parseAmount(totalAmountMatch[1])
    : debitedAmountMatch
      ? parseAmount(debitedAmountMatch[1])
      : null;

  return {
    amount,
    payerName: extractPayerName(normalized),
    paymentDate: dateMatch ? parseReceiptDate(dateMatch[1]) : null,
    transactionId: txnMatch?.[1] ?? null,
    rawText: normalized,
  };
}

async function ocrWithOpenAi(imageBuffer: Buffer, mimeType: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const base64 = imageBuffer.toString('base64');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Read all visible text from this Ethiopian bank payment receipt screenshot. Return plain text only, preserving amounts, names, dates, and transaction IDs exactly as shown.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 800,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

/** Optional: system `tesseract` CLI if installed (safe in Next.js – no worker threads). */
async function ocrWithSystemTesseract(absolutePath: string): Promise<string | null> {
  try {
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);
    const { stdout } = await execFileAsync('tesseract', [absolutePath, 'stdout', '-l', 'eng'], {
      timeout: 60_000,
      maxBuffer: 1024 * 1024,
    });
    const text = stdout?.trim();
    return text && text.length > 20 ? text : null;
  } catch {
    return null;
  }
}

export async function extractTextFromReceiptFile(
  absolutePath: string,
  mimeType = 'image/jpeg'
): Promise<string | null> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(absolutePath);

  const openAiText = await ocrWithOpenAi(buffer, mimeType);
  if (openAiText && openAiText.length > 20) return openAiText;

  return ocrWithSystemTesseract(absolutePath);
}

export async function extractReceiptFromImagePath(
  absolutePath: string,
  mimeType = 'image/jpeg'
): Promise<ExtractedReceiptData> {
  const rawText = (await extractTextFromReceiptFile(absolutePath, mimeType)) ?? '';
  if (!rawText) {
    return {
      amount: null,
      payerName: null,
      paymentDate: null,
      transactionId: null,
      rawText: '',
    };
  }
  return parseCbeReceiptText(rawText);
}
