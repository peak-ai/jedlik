export function encode(str: string): string {
  return Buffer.from(str).toString('hex');
}
