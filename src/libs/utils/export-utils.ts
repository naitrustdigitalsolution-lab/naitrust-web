/**
 * Export utilities for charts and data
 * Supports PDF, Image, and CSV exports
 */

import { toPng, toJpeg } from 'html-to-image';

/**
 * Export chart/data as image (PNG)
 */
export async function exportAsImage(elementId: string, filename: string = 'export'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      quality: 1.0,
      pixelRatio: 2,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting as image:', error);
    throw error;
  }
}

/**
 * Export chart/data as PDF (opens in new window for printing)
 */
export async function exportAsPDF(elementId: string, filename: string = 'export', title?: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Convert to image first
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      quality: 1.0,
      pixelRatio: 2,
    });

    // Create a new window with the image for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups to export as PDF.');
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @media print {
              @page { margin: 0; size: landscape; }
              body { margin: 0; }
            }
            body {
              margin: 20px;
              text-align: center;
            }
            h1 {
              margin-bottom: 20px;
              font-family: Arial, sans-serif;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${title ? `<h1>${title}</h1>` : ''}
          <img src="${dataUrl}" alt="${filename}" />
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    // Fallback to PNG export
    await exportAsImage(elementId, filename);
  }
}

/**
 * Export data as CSV
 */
export function exportAsCSV(data: any[], filename: string = 'export'): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

/**
 * Export chart data as CSV (for Recharts)
 */
export function exportChartDataAsCSV(data: any[], filename: string = 'chart-data'): void {
  exportAsCSV(data, filename);
}

