/**
 * User-intent commands for Motivation mutations.
 *
 * One confirmed user action produces exactly one immutable command: a fresh
 * canonical UUID v4 `Idempotency-Key` plus its exact body snapshot. Retrying
 * an unresolved command reuses the same key and body; a changed payload is a
 * new command with a new key.
 */
export interface MotivationCommand<TBody> {
  readonly key: string;
  readonly body: Readonly<TBody>;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const property of Object.values(value as Record<string, unknown>)) {
      deepFreeze(property);
    }
    Object.freeze(value);
  }
  return value;
}

/** Fresh canonical lowercase UUID v4 (may be stubbed in tests). */
export function createMotivationCommandKey(): string {
  return crypto.randomUUID();
}

/** Seals one user intent into an immutable command snapshot with a new key. */
export function createMotivationCommand<TBody>(body: TBody): MotivationCommand<TBody> {
  return deepFreeze({
    key: createMotivationCommandKey(),
    body: deepFreeze(body),
  }) as MotivationCommand<TBody>;
}

/**
 * Single-slot in-flight lock for one mutating flow (e.g. the sheet editor).
 * While a command is unresolved, new submissions are rejected; retrying the
 * exact same command (same idempotency key) is always admitted.
 */
export class MotivationInFlightGuard {
  private inFlight: string | null = null;

  /** `true` when the command may be sent now, `false` when one is in flight. */
  public tryBegin(command: MotivationCommand<unknown>): boolean {
    if (this.inFlight !== null && this.inFlight !== command.key) {
      return false;
    }
    this.inFlight = command.key;
    return true;
  }

  /** Releases the slot; a foreign key is ignored. */
  public finish(command: MotivationCommand<unknown>): void {
    if (this.inFlight === command.key) {
      this.inFlight = null;
    }
  }

  /** Key of the unresolved command, or `null`. */
  public inFlightKey(): string | null {
    return this.inFlight;
  }
}
