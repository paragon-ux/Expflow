import { randomBytes } from 'node:crypto';

export type ExpflowIdPrefix = 'efp' | 'efo' | 'efn' | 'eft' | 'efv' | 'efs' | 'efrd' | 'efad';

const CROCKFORD_NO_ILOU = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function createExpflowId(prefix: ExpflowIdPrefix): string {
  const bytes = randomBytes(26);
  let suffix = '';
  for (const byte of bytes) {
    suffix += CROCKFORD_NO_ILOU[byte % CROCKFORD_NO_ILOU.length] ?? '0';
  }
  return `${prefix}_${suffix}`;
}
