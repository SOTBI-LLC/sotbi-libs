/**
 * Exact display formatting for Motivation coefficients.
 *
 * The wire value is an unsigned integer count of ten-thousandths
 * (`12550` means `1.2550` / `125,50%`). All math below stays in the
 * integer domain so no float rounding can alter the displayed digits.
 */

function assertTenThousandths(tenThousandths: number): void {
  if (
    !Number.isSafeInteger(tenThousandths) ||
    tenThousandths < 0 ||
    tenThousandths > 0xffffffff
  ) {
    throw new RangeError(
      `Coefficient must be a uint32 ten-thousandths count, got ${tenThousandths}`,
    );
  }
}

/** `12550` → `'125,50%'` — percent with exactly two decimals, integer math only. */
export function formatCoefficientPercent(tenThousandths: number): string {
  assertTenThousandths(tenThousandths);
  const whole = Math.trunc(tenThousandths / 100);
  const hundredths = tenThousandths % 100;
  return `${whole},${String(hundredths).padStart(2, '0')}%`;
}

/** `12550` → `'1.2550'` — the exact four-decimal coefficient for details and tooltips. */
export function formatCoefficientExact(tenThousandths: number): string {
  assertTenThousandths(tenThousandths);
  const whole = Math.trunc(tenThousandths / 10000);
  const fraction = tenThousandths % 10000;
  return `${whole}.${String(fraction).padStart(4, '0')}`;
}

/**
 * `2026-09-17` → `'17.09.2026'` by string slicing only — no `Date`
 * construction, so a date-only value can never shift across timezones.
 * Malformed input is returned unchanged.
 */
export function formatDateOnly(value: string): string {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return parts ? `${parts[3]}.${parts[2]}.${parts[1]}` : value;
}
