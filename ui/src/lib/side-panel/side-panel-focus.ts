/** Restore keyboard access after either declarative or programmatic panel teardown. */
export function restorePanelFocus(
  document: Document,
  initiator: HTMLElement | null,
): void {
  const target =
    initiator?.isConnected && initiator !== document.body
      ? initiator
      : Array.from(
          document.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).find(
          (element) =>
            element.getClientRects().length > 0 &&
            !element.closest('[inert], [hidden], [aria-hidden="true"]'),
        );
  target?.focus({ preventScroll: true });
}
