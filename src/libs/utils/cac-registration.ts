export const CAC_PREFIXES = ['RC', 'BN', 'IT', 'LLP'] as const;

export type CACPrefix = typeof CAC_PREFIXES[number];

export const stripCACPrefix = (value: string) => {
  const prefixRegex = new RegExp(`^(${CAC_PREFIXES.join('|')})`, 'i');
  return value.replace(prefixRegex, '').replace(/[^0-9]/g, '');
};

export const applyCACPrefix = (value: string, prefix?: CACPrefix | '') => {
  const numericPart = value.replace(/[^0-9]/g, '');
  if (!numericPart) return '';
  if (!prefix) return numericPart;
  return `${prefix}${numericPart}`;
};
