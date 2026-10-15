type IsoConvertible = {
  toISO(): string | null;
};

function isIsoConvertible(value: unknown): value is IsoConvertible {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<IsoConvertible>).toISO === 'function'
  );
}

/**
 * Reduces a date/time value (string, `Date` or Luxon `DateTime` coming from a
 * `dateTime` parameter or an expression) to its `YYYY-MM-DD` part, which is
 * the format the payment endpoints expect. Empty values become `undefined`
 * and values that do not start with a date are sent as-is.
 */
export function formatDate(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const primitive: string | number = value as string | number;

  const text: string = isIsoConvertible(value)
    ? (value.toISO() ?? '')
    : String(primitive).trim();

  const match: RegExpMatchArray | null = /^\d{4}-\d{2}-\d{2}/.exec(text);

  return match ? match[0] : text || undefined;
}
