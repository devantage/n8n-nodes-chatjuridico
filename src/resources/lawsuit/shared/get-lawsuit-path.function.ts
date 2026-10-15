/**
 * Builds the path of an office lawsuit. CNJ numbers contain dots and dashes,
 * so the value is always URL encoded.
 */
export function getLawsuitPath(cnj: string, suffix: string = ''): string {
  return `lawsuits/${encodeURIComponent(cnj.trim())}${suffix}`;
}
