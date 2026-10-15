/**
 * Converts a comma separated string (or an array coming from an expression)
 * into a trimmed list without empty entries.
 */
export function splitList(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  const values: string[] = Array.isArray(value) ? value : value.split(',');

  return values
    .map((curValue: string): string => curValue.trim())
    .filter((curValue: string): boolean => curValue.length > 0);
}
