/** Small uploads keep the preview responsive; binary files live outside localStorage. */
export const MAX_EVIDENCE_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_EVIDENCE_BATCH_BYTES = 4 * 1024 * 1024;
export const MAX_EVIDENCE_FILES = 3;
export const MAX_EVIDENCE_DEAL_BYTES = 20 * 1024 * 1024;
export function formatFileSize(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
export async function prepareEvidenceFile(file: File): Promise<{ file: File; originalSizeBytes: number }> {
  if (!/\.(pdf|jpe?g|png|mp4|mov|webm)$/i.test(file.name)) throw new Error('Choose PDF, JPG, PNG, MP4, MOV or WebM.');
  if (!file.size) throw new Error('Empty files cannot be uploaded.');
  // Never decode an unbounded image. PDFs and videos are not altered.
  if (file.size > 10 * 1024 * 1024) throw new Error('Source files must be 10 MB or smaller.');
  let result = file;
  if (/^image\/(jpeg|png)$/.test(file.type)) {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image preparation is unavailable.');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not prepare image.')), 'image/jpeg', 0.88));
      if (scale < 1 || blob.size < file.size) result = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    } finally { bitmap.close(); }
  }
  if (result.size > MAX_EVIDENCE_FILE_BYTES) throw new Error(`${file.name} is ${formatFileSize(result.size)}. Maximum saved size is 2 MB per file. Reduce the file size and try again.`);
  return { file: result, originalSizeBytes: file.size };
}
export function fileDataUrl(blob: Blob) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('File could not be read.')); reader.readAsDataURL(blob); }); }
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('naitrust-evidence-preview', 1); request.onupgradeneeded = () => request.result.createObjectStore('files'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(new Error('Browser file storage is unavailable.')); });
}
export async function storeEvidenceFile(key: string, dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob(); const db = await database();
  try { await new Promise<void>((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(blob, key); tx.oncomplete = () => resolve(); tx.onerror = () => reject(new Error('Not enough browser storage. Remove unused files or use a smaller file.')); }); } finally { db.close(); }
  return `mock-evidence:${key}`;
}
/** Call only after the owning deal or assignment has authorized this exact file. */
export async function resolveEvidenceFile(reference: string) {
  if (!reference.startsWith('mock-evidence:')) return reference;
  const db = await database();
  try {
    const blob = await new Promise<Blob>((resolve, reject) => { const request = db.transaction('files').objectStore('files').get(reference.slice('mock-evidence:'.length)); request.onsuccess = () => request.result ? resolve(request.result) : reject(new Error('This preview file is no longer available in this browser.')); request.onerror = () => reject(new Error('Could not open file.')); });
    return await fileDataUrl(blob);
  } finally { db.close(); }
}
export function dataUrlBytes(url?: string) {
  if (!url?.startsWith('data:')) return 0;
  const data = url.split(',')[1] ?? ''; return Math.floor(data.length * 3 / 4) - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
}
