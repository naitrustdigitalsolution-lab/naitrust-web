import type { CounterpartyProfile } from '../store/types';
import { formatMinorAmount } from '../utils/safe-deal-presentation';
import { counterpartyRelationLabel } from './counterparty-options';
import type { CounterpartyTransaction } from './types';
import naitrustLogo from '../../assets/naitrust-logo/naitrust-icon-3.png';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function safeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function downloadCounterpartyReport(
  counterparty: CounterpartyProfile,
  transactions: CounterpartyTransaction[],
): Promise<void> {
  const totalMinor = transactions.reduce((sum, transaction) => sum + transaction.amountMinor, 0);
  const [{ jsPDF }, logoBlob] = await Promise.all([import('jspdf'), fetch(naitrustLogo).then((response) => response.blob())]);
  const logoData = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(logoBlob); });
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pdf.addImage(logoData, 'PNG', 44, 38, 28, 28);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(17); pdf.setTextColor('#1e90ff'); pdf.text('Naitrust', 82, 59);
  pdf.setFontSize(9); pdf.setTextColor('#64748b'); pdf.text('BUSINESS RELATIONSHIP REPORT', 44, 90);
  pdf.setFontSize(23); pdf.setTextColor('#071b31'); pdf.text(counterparty.name, 44, 121, { maxWidth: 505 });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor('#64748b'); pdf.text(`Generated ${formatDate(new Date().toISOString())}`, 44, 143);
  pdf.setFillColor('#eff9ff'); pdf.roundedRect(40, 165, 515, 120, 10, 10, 'F');
  const summary = [
    `Relationship: ${counterpartyRelationLabel(counterparty.relation)}`,
    `Business: ${counterparty.businessName ?? 'Not available'}`,
    `Email: ${counterparty.email ?? 'Not available'}`,
    `Phone: ${counterparty.phone ?? 'Not available'}`,
    `Completed transactions: ${transactions.length}`,
    `Recorded value: ${formatMinorAmount(totalMinor, transactions[0]?.currency ?? 'NGN')}`,
  ];
  pdf.setTextColor('#071b31'); pdf.setFontSize(10.5); summary.forEach((line, index) => pdf.text(line, 56 + (index % 2) * 250, 191 + Math.floor(index / 2) * 34, { maxWidth: 225 }));
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.text('Completed transaction history', 44, 325);
  let y = 352;
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5);
  if (!transactions.length) pdf.text('No completed transactions are recorded for this contact yet.', 44, y);
  for (const transaction of transactions) {
    if (y > 760) { pdf.addPage(); y = 50; }
    pdf.setFont('helvetica', 'bold'); pdf.text(transaction.title, 44, y, { maxWidth: 230 });
    pdf.setFont('helvetica', 'normal'); pdf.setTextColor('#64748b'); pdf.text(`${formatDate(transaction.completedAt)} · ${transaction.reference}`, 44, y + 14);
    pdf.setTextColor('#071b31'); pdf.text(transaction.direction === 'received' ? 'Received' : 'Sent', 355, y);
    pdf.setFont('helvetica', 'bold'); pdf.text(formatMinorAmount(transaction.amountMinor, transaction.currency), 545, y, { align: 'right' });
    pdf.setDrawColor('#e2e8f0'); pdf.line(44, y + 24, 551, y + 24); y += 42;
  }
  if (y > 755) { pdf.addPage(); y = 50; }
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor('#94a3b8');
  pdf.text('This relationship summary is not a bank statement, tax invoice, or proof of settlement.', 44, y + 28, { maxWidth: 500 });
  pdf.save(`naitrust-${safeSlug(counterparty.name) || 'contact'}-report.pdf`);
}
