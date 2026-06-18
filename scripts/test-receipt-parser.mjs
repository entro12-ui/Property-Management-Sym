/** Standalone CBE receipt parser test (mirrors src/lib/receipt-extraction.ts). */

function parseAmount(value) {
  const n = parseFloat(value.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parseReceiptDate(value) {
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return null;
  const [, day, mon, year] = match;
  const parsed = new Date(`${day} ${mon} ${year} 12:00:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractPayerName(normalized) {
  const dear = normalized.match(/Dear\s+([A-Z][A-Z\s]+?)(?:,|\.|\s+ETB)/i);
  if (dear) return dear[1].replace(/\s+/g, ' ').trim();

  const debitedFrom = normalized.match(/debited from\s+([A-Z][A-Z\s]+?)\s+for/i);
  if (debitedFrom && !/^your account$/i.test(debitedFrom[1].trim())) {
    return debitedFrom[1].replace(/\s+/g, ' ').trim();
  }

  return null;
}

function parseCbeReceiptText(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const totalAmountMatch = normalized.match(/Total Amount Debited\s+ETB\s+([\d,]+\.?\d*)/i);
  const debitedAmountMatch = normalized.match(/ETB\s+([\d,]+\.?\d*)\s+(?:has been )?debited/i);
  const dateMatch = normalized.match(/\bon\s+(\d{1,2}-[A-Za-z]{3}-\d{4})\b/i);
  const txnMatch =
    normalized.match(/Transaction ID[:\s]+([A-Z0-9]+)/i) ??
    normalized.match(/transaction ID[:\s]+([A-Z0-9]+)/i);

  return {
    amount: totalAmountMatch
      ? parseAmount(totalAmountMatch[1])
      : debitedAmountMatch
        ? parseAmount(debitedAmountMatch[1])
        : null,
    payerName: extractPayerName(normalized),
    paymentDate: dateMatch ? parseReceiptDate(dateMatch[1]) : null,
    transactionId: txnMatch?.[1] ?? null,
  };
}

const samples = [
  {
    name: 'invoice 1',
    text: `Dear NATNAEL MEKURIA ZEWDU, ETB 5,666.00 has been debited from your account for NEGA CHERE NIBRET-ETB-2504 on 22-May-2026. Transaction ID: FT261423RG5T. Total Amount Debited ETB 5668.40 with commission of ETB 2.00`,
    expected: { amount: 5668.4, payer: 'NATNAEL MEKURIA ZEWDU', date: '2026-05-22', txn: 'FT261423RG5T' },
  },
  {
    name: 'invoice 2',
    text: `ETB 25,000.00 debited from NATNAEL MEKURIA ZEWDU for NEGA CHERE NIBRET-ETB-2504 on 25-May-2026 with transaction ID: FT261457QDP8. Total Amount Debited ETB 25003.60 with commission of ETB 3.00`,
    expected: { amount: 25003.6, payer: 'NATNAEL MEKURIA ZEWDU', date: '2026-05-25', txn: 'FT261457QDP8' },
  },
];

let passed = 0;
for (const s of samples) {
  const r = parseCbeReceiptText(s.text);
  const ok =
    r.amount === s.expected.amount &&
    r.payerName === s.expected.payer &&
    r.transactionId === s.expected.txn &&
    r.paymentDate?.toISOString().slice(0, 10) === s.expected.date;

  if (ok) {
    console.log(`✓ ${s.name}`);
    passed++;
  } else {
    console.log(`✗ ${s.name}`, r);
  }
}

console.log(`\n${passed}/${samples.length} parser tests passed`);
process.exit(passed === samples.length ? 0 : 1);
