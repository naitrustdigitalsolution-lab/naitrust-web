/**
 * Deal Documents
 * Generates real, customer-friendly PDF documents from a safe deal — the Safe
 * deal agreement and a concise deal summary card. Rendered client-side from a
 * styled, offscreen HTML node via html2pdf.js (html2canvas + jsPDF), so the
 * customer gets a normal .pdf they can open on any phone — never raw HTML.
 *
 * The heavy PDF library is imported dynamically so it only loads when a user
 * actually downloads, keeping it out of the main bundle.
 */

import type { SafeDealDetail } from '../store/types';
import {
  formatMinorAmount,
  getStatusPresentation,
  partyModeLabel,
  roleLabel,
} from './safe-deal-presentation';

/** Escape strings before injecting into the HTML template. */
function esc(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

/** Filesystem-friendly slug from a deal reference. */
function slug(reference: string): string {
  return reference.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

/**
 * html2canvas-safe styling — plain block/flex/table only (no CSS grid, no
 * ::before counters, no emoji), so the rasteriser reproduces it faithfully.
 */
const DOC_STYLE = `
  .nt-doc *{box-sizing:border-box;margin:0;padding:0}
  .nt-doc{font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#fff;padding:40px;width:794px;line-height:1.55}
  .nt-brand{display:flex;align-items:center;margin-bottom:6px}
  .nt-logo{width:26px;height:26px;border-radius:7px;background:#1e90ff;color:#fff;font-weight:800;font-size:15px;text-align:center;line-height:26px;margin-right:8px}
  .nt-brandname{font-weight:800;font-size:18px;color:#1e90ff}
  .nt-kicker{color:#64748b;font-size:12px;letter-spacing:.04em;text-transform:uppercase;font-weight:600}
  .nt-title{font-size:23px;font-weight:800;margin:14px 0 4px}
  .nt-sub{color:#64748b;font-size:13px}
  .nt-meta{width:100%;border-collapse:separate;border-spacing:0;margin:22px 0;background:#f8fafc;border:1px solid #eef2f7;border-radius:12px;overflow:hidden}
  .nt-meta td{padding:12px 16px;font-size:13px;vertical-align:top;width:50%;border-bottom:1px solid #eef2f7}
  .nt-label{color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-size:10px;font-weight:700;display:block;margin-bottom:3px}
  .nt-value{color:#0f172a;font-weight:600;font-size:14px}
  .nt-amount{font-size:24px;font-weight:800;color:#0f172a}
  .nt-section{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;font-weight:700;margin:26px 0 12px;border-bottom:1px solid #eef2f7;padding-bottom:6px}
  .nt-clause{display:flex;margin:14px 0}
  .nt-num{flex:0 0 auto;width:24px;height:24px;background:#e8f2ff;color:#1e90ff;border-radius:999px;font-size:12px;font-weight:700;text-align:center;line-height:24px;margin-right:12px}
  .nt-clause h3{font-size:14px;margin-bottom:3px}
  .nt-clause p{color:#334155;font-size:13px}
  .nt-party{display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px dashed #eef2f7}
  .nt-party .role{color:#64748b}
  .nt-pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:#e8f2ff;color:#1e90ff}
  .nt-note{color:#475569;font-size:13px}
  .nt-foot{margin-top:30px;padding-top:14px;border-top:1px solid #eef2f7;font-size:11px;color:#94a3b8}
`;

/** Render an inner-HTML string to a downloaded PDF via an offscreen node. */
async function renderPdf(filename: string, innerHtml: string): Promise<void> {
  const holder = document.createElement('div');
  holder.className = 'nt-doc';
  holder.style.position = 'fixed';
  holder.style.left = '-99999px';
  holder.style.top = '0';
  holder.innerHTML = `<style>${DOC_STYLE}</style>${innerHtml}`;
  document.body.appendChild(holder);
  try {
    const { default: html2pdf } = await import('html2pdf.js');
    await html2pdf()
      .set({
        margin: [18, 0, 18, 0],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, windowWidth: 794 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      })
      .from(holder)
      .save();
  } finally {
    holder.remove();
  }
}

/** Download the Safe deal agreement as a PDF. */
export async function downloadAgreementDocument(deal: SafeDealDetail): Promise<void> {
  const clauses = deal.agreement.sections
    .map(
      (s, i) =>
        `<div class="nt-clause"><span class="nt-num">${i + 1}</span><div><h3>${esc(
          s.heading,
        )}</h3><p>${esc(s.body)}</p></div></div>`,
    )
    .join('');
  const parties = deal.parties
    .map(
      (p) =>
        `<div class="nt-party"><span>${esc(p.name)}${p.isYou ? ' (you)' : ''}</span><span class="role">${esc(
          roleLabel(p.role),
        )} &middot; ${esc(p.status)}</span></div>`,
    )
    .join('');

  const inner = `
    <div class="nt-brand"><span class="nt-logo">N</span><span class="nt-brandname">Naitrust</span></div>
    <div class="nt-kicker">Safe deal agreement</div>
    <div class="nt-title">${esc(deal.title)}</div>
    <div class="nt-sub">Reference ${esc(deal.reference)} &middot; ${esc(partyModeLabel(deal.partyMode))}</div>
    <table class="nt-meta"><tbody>
      <tr><td><span class="nt-label">Protected amount</span><span class="nt-amount">${esc(
        formatMinorAmount(deal.amountMinor, deal.currency),
      )}</span></td><td><span class="nt-label">Created</span><span class="nt-value">${esc(
    formatDate(deal.createdAt),
  )}</span></td></tr>
      <tr><td><span class="nt-label">Delivery due</span><span class="nt-value">${esc(
        deal.deliveryDueDate ? formatDate(deal.deliveryDueDate) : '—',
      )}</span></td><td><span class="nt-label">Agreement version</span><span class="nt-value">v${esc(
    String(deal.agreement.version),
  )}</span></td></tr>
    </tbody></table>
    <div class="nt-section">Parties</div>
    ${parties}
    <div class="nt-section">Terms</div>
    ${clauses}
    <div class="nt-section">Release conditions</div>
    <p class="nt-note">${esc(deal.releaseConditions || '—')}</p>
    <div class="nt-foot">Generated by Naitrust on ${esc(
      formatDate(new Date().toISOString()),
    )}. Funds are held by a regulated financial provider and released per the terms above. This document reflects the agreement both parties accepted for reference ${esc(
    deal.reference,
  )}.</div>
  `;
  await renderPdf(`naitrust-agreement-${slug(deal.reference)}.pdf`, inner);
}

/** Download a concise deal summary card as a PDF. */
export async function downloadDealSummaryCard(deal: SafeDealDetail): Promise<void> {
  const status = getStatusPresentation(deal.status);
  const you = deal.parties.find((p) => p.isYou);
  const other = deal.parties.find((p) => !p.isYou);

  const inner = `
    <div class="nt-brand"><span class="nt-logo">N</span><span class="nt-brandname">Naitrust</span></div>
    <div class="nt-kicker">Deal summary card</div>
    <div class="nt-title">${esc(deal.title)}</div>
    <div class="nt-sub">Reference ${esc(deal.reference)} &middot; <span class="nt-pill">${esc(
    status.label,
  )}</span></div>
    <table class="nt-meta"><tbody>
      <tr><td><span class="nt-label">Protected amount</span><span class="nt-amount">${esc(
        formatMinorAmount(deal.amountMinor, deal.currency),
      )}</span></td><td><span class="nt-label">Type</span><span class="nt-value">${esc(
    partyModeLabel(deal.partyMode),
  )}</span></td></tr>
      <tr><td><span class="nt-label">You</span><span class="nt-value">${esc(
        you ? `${you.name} · ${roleLabel(you.role)}` : '—',
      )}</span></td><td><span class="nt-label">Counterparty</span><span class="nt-value">${esc(
    other ? `${other.name} · ${roleLabel(other.role)}` : deal.counterpartyName,
  )}</span></td></tr>
      <tr><td><span class="nt-label">Created</span><span class="nt-value">${esc(
        formatDate(deal.createdAt),
      )}</span></td><td><span class="nt-label">Delivery due</span><span class="nt-value">${esc(
    deal.deliveryDueDate ? formatDate(deal.deliveryDueDate) : '—',
  )}</span></td></tr>
    </tbody></table>
    <div class="nt-section">Funding</div>
    <p class="nt-note">Held by ${esc(deal.funding.partner)} — ${esc(
    formatMinorAmount(deal.funding.amountReceivedMinor, deal.funding.currency),
  )} received of ${esc(formatMinorAmount(deal.funding.amountExpectedMinor, deal.funding.currency))} expected.</p>
    <div class="nt-section">What's protected</div>
    <p class="nt-note">${esc(deal.description || deal.releaseConditions || '—')}</p>
    <div class="nt-foot">Generated by Naitrust on ${esc(
      formatDate(new Date().toISOString()),
    )}. This card summarises deal ${esc(deal.reference)} for your records.</div>
  `;
  await renderPdf(`naitrust-deal-${slug(deal.reference)}.pdf`, inner);
}
