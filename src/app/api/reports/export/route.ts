import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ADMIN_ROLES = ['SUPER_ADMIN', 'BUILDING_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT'];

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'xlsx';
  const type = searchParams.get('type') ?? 'financial';
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10);

  if (type === 'financial') {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const [payments, incomes, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: { paidAt: { gte: start, lte: end } },
        include: { invoice: { include: { unit: { include: { building: true } } } } },
        orderBy: { paidAt: 'asc' },
      }),
      prisma.income.findMany({
        where: { incomeDate: { gte: start, lte: end } },
        include: { building: true },
        orderBy: { incomeDate: 'asc' },
      }),
      prisma.expense.findMany({
        where: { expenseDate: { gte: start, lte: end } },
        include: { building: true },
        orderBy: { expenseDate: 'asc' },
      }),
    ]);

    const totalIncome =
      payments.reduce((s, p) => s + Number(p.amount), 0) +
      incomes.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Financial Report ${year}`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, 32);
      doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, 40);
      doc.text(`Net Profit: ${formatCurrency(totalIncome - totalExpenses)}`, 14, 48);

      autoTable(doc, {
        startY: 58,
        head: [['Date', 'Type', 'Description', 'Amount']],
        body: [
          ...payments.map((p) => [
            p.paidAt.toISOString().slice(0, 10),
            'Payment',
            `${p.invoice.unit.building.name} - ${p.invoice.unit.unitNumber}`,
            formatCurrency(p.amount),
          ]),
          ...incomes.map((i) => [
            i.incomeDate.toISOString().slice(0, 10),
            i.type,
            i.description ?? i.building.name,
            formatCurrency(i.amount),
          ]),
        ],
      });

      autoTable(doc, {
        startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
        head: [['Date', 'Category', 'Description', 'Amount']],
        body: expenses.map((e) => [
          e.expenseDate.toISOString().slice(0, 10),
          e.category,
          e.description ?? '',
          formatCurrency(e.amount),
        ]),
      });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="financial-report-${year}.pdf"`,
        },
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Financial Summary');
    sheet.addRow(['Financial Report', year]);
    sheet.addRow(['Total Income', totalIncome]);
    sheet.addRow(['Total Expenses', totalExpenses]);
    sheet.addRow(['Net Profit', totalIncome - totalExpenses]);
    sheet.addRow([]);

    const paySheet = workbook.addWorksheet('Payments');
    paySheet.addRow(['Date', 'Building', 'Unit', 'Amount (ETB)', 'Method', 'Receipt #']);
    for (const p of payments) {
      paySheet.addRow([
        p.paidAt.toISOString().slice(0, 10),
        p.invoice.unit.building.name,
        p.invoice.unit.unitNumber,
        Number(p.amount),
        p.method,
        p.receiptNumber ?? '',
      ]);
    }

    const expSheet = workbook.addWorksheet('Expenses');
    expSheet.addRow(['Date', 'Building', 'Category', 'Description', 'Amount (ETB)', 'Status']);
    for (const e of expenses) {
      expSheet.addRow([
        e.expenseDate.toISOString().slice(0, 10),
        e.building.name,
        e.category,
        e.description ?? '',
        Number(e.amount),
        e.approvalStatus,
      ]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="financial-report-${year}.xlsx"`,
      },
    });
  }

  if (type === 'tenants') {
    const tenants = await prisma.tenantProfile.findMany({
      include: {
        user: true,
        unit: { include: { building: true } },
      },
    });

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Tenant Roster', 14, 20);
      autoTable(doc, {
        startY: 28,
        head: [['Name', 'Room', 'Phone', 'Status', 'National ID', 'TIN']],
        body: tenants.map((t) => [
          t.user.fullName,
          t.unit ? `${t.unit.building.name} - ${t.unit.unitNumber}` : '—',
          t.user.phone ?? '',
          t.tenantStatus,
          t.nationalId ?? '',
          t.tinNumber ?? '',
        ]),
      });
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="tenant-roster.pdf"',
        },
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tenants');
    sheet.addRow(['Name', 'Email', 'Phone', 'Room', 'Floor', 'Status', 'National ID', 'TIN', 'Occupation']);
    for (const t of tenants) {
      sheet.addRow([
        t.user.fullName,
        t.user.email,
        t.user.phone ?? '',
        t.unit?.unitNumber ?? '',
        t.unit?.floorNumber ?? '',
        t.tenantStatus,
        t.nationalId ?? '',
        t.tinNumber ?? '',
        t.occupation ?? '',
      ]);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="tenant-roster.xlsx"',
      },
    });
  }

  return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
}
