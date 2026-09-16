export function createId(prefix = 'n'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
