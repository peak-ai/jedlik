import crypto from 'crypto';

export const id = (): string => crypto.randomBytes(20).toString('hex');
export const toName = (key: string): string => `#${key}`;
export const toValue = (key: string): string => `:${key}`;
