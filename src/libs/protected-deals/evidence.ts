export const DEAL_EVIDENCE_KINDS = [
  'Invoice',
  'Waybill',
  'Product model',
  'Serial / IMEI',
  'Working condition',
  'Packaging condition',
  'Tamper seal',
  'Courier details',
  'Pickup evidence',
  'Delivery insurance',
  'Pre-shipment evidence',
  'Buyer problem evidence',
  'Product contents',
  'Delivery confirmation',
  'Return condition',
  'Photo',
  'Inspection report',
  'Receipt',
  'Other',
] as const;

export const DEAL_EVIDENCE_ACCEPT = '.pdf,.jpg,.jpeg,.png,.mp4,.mov,.webm';
export const DEAL_EVIDENCE_FORMATS = 'PDF, JPG, PNG, MP4, MOV or WebM';
