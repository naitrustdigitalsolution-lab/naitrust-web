import type { CounterpartyProfile } from '../store/types';
import { formatMinorAmount } from '../utils/safe-deal-presentation';
import { counterpartyRelationLabel } from './counterparty-options';
import type { CounterpartyTransaction } from './types';

function escapeHtml(value: string | undefined): string {
  return String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

const REPORT_STYLE = `
  .report *{box-sizing:border-box;margin:0;padding:0}
  .report{width:794px;padding:42px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#071b31;background:#fff;line-height:1.5}
  .brand{display:flex;align-items:center;gap:9px;color:#1687f8;font-size:19px;font-weight:800}
  .logo{display:inline-flex;width:28px;height:28px;align-items:center;justify-content:center;border-radius:8px;background:#1687f8;color:#fff}
  .kicker{margin-top:28px;color:#64748b;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  h1{margin-top:5px;font-size:28px;line-height:1.2}.sub{margin-top:6px;color:#64748b;font-size:13px}
  .summary{margin-top:24px;padding:18px;border:1px solid #dbeafe;border-radius:14px;background:#eff9ff}
  .summary table,.transactions{width:100%;border-collapse:collapse}.summary td{width:50%;padding:7px 8px;font-size:13px;vertical-align:top}
  .label{display:block;color:#64748b;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}.value{font-weight:650}
  h2{margin:28px 0 10px;font-size:15px}.transactions th{padding:9px 6px;border-bottom:1px solid #cbd5e1;color:#64748b;font-size:10px;text-align:left;text-transform:uppercase}
  .transactions td{padding:11px 6px;border-bottom:1px solid #e2e8f0;font-size:12px}.amount{text-align:right;font-weight:700}.empty{padding:22px;background:#f8fafc;color:#64748b;font-size:13px}
  .foot{margin-top:30px;padding-top:14px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:10px}
`;

export async function downloadCounterpartyReport(
  counterparty: CounterpartyProfile,
  transactions: CounterpartyTransaction[],
): Promise<void> {
  const totalMinor = transactions.reduce((sum, transaction) => sum + transaction.amountMinor, 0);
  const rows = transactions.map((transaction) => `
    <tr>
      <td>${escapeHtml(formatDate(transaction.completedAt))}</td>
      <td><strong>${escapeHtml(transaction.title)}</strong><br>${escapeHtml(transaction.reference)}</td>
      <td>${transaction.direction === 'received' ? 'Received' : 'Sent'}</td>
      <td class="amount">${escapeHtml(formatMinorAmount(transaction.amountMinor, transaction.currency))}</td>
    </tr>
  `).join('');

  const node = document.createElement('div');
  node.className = 'report';
  node.style.position = 'fixed';
  node.style.left = '-99999px';
  node.style.top = '0';
  node.innerHTML = `
    <style>${REPORT_STYLE}</style>
    <div class="brand"><span class="logo">N</span>Naitrust</div>
    <div class="kicker">Business relationship report</div>
    <h1>${escapeHtml(counterparty.name)}</h1>
    <p class="sub">Generated ${escapeHtml(formatDate(new Date().toISOString()))}</p>
    <div class="summary"><table><tbody>
      <tr><td><span class="label">Relationship</span><span class="value">${escapeHtml(counterpartyRelationLabel(counterparty.relation))}</span></td><td><span class="label">Business</span><span class="value">${escapeHtml(counterparty.businessName)}</span></td></tr>
      <tr><td><span class="label">Email</span><span class="value">${escapeHtml(counterparty.email)}</span></td><td><span class="label">Phone</span><span class="value">${escapeHtml(counterparty.phone)}</span></td></tr>
      <tr><td><span class="label">Completed transactions</span><span class="value">${transactions.length}</span></td><td><span class="label">Recorded value</span><span class="value">${escapeHtml(formatMinorAmount(totalMinor, transactions[0]?.currency ?? 'NGN'))}</span></td></tr>
    </tbody></table></div>
    <h2>Completed transaction history</h2>
    ${rows ? `<table class="transactions"><thead><tr><th>Date</th><th>Transaction</th><th>Direction</th><th class="amount">Amount</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="empty">No completed transactions are recorded for this contact yet.</p>'}
    <p class="foot">This report is generated from the business records currently shown in Naitrust. It is a relationship summary and not a bank statement, tax invoice, or proof of settlement.</p>
  `;
  document.body.appendChild(node);
  try {
    const { default: html2pdf } = await import('html2pdf.js');
    await html2pdf().set({
      margin: [18, 0, 18, 0],
      filename: `naitrust-${safeSlug(counterparty.name) || 'contact'}-report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, windowWidth: 794 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
    }).from(node).save();
  } finally {
    node.remove();
  }
}

