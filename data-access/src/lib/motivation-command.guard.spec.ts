import { createMotivationCommand, MotivationInFlightGuard } from './motivation-command';
import type { MotivationCommand } from './motivation-command';

describe('MotivationInFlightGuard', () => {
  let guard: MotivationInFlightGuard;

  beforeEach(() => {
    guard = new MotivationInFlightGuard();
  });

  it('admits the first command and blocks a second submission while in flight', () => {
    const first = createMotivationCommand({ tenThousandths: 1 });
    const second = createMotivationCommand({ tenThousandths: 2 });

    expect(guard.tryBegin(first)).toBe(true);
    expect(guard.tryBegin(second)).toBe(false);
  });

  it('re-admits the identical command key as a same-intent retry', () => {
    const command = createMotivationCommand({ tenThousandths: 1 });
    guard.tryBegin(command);
    guard.finish(command);

    expect(guard.tryBegin(command)).toBe(true);
  });

  it('ignores finish of a foreign command', () => {
    const command = createMotivationCommand({ tenThousandths: 1 });
    const foreign = createMotivationCommand({ tenThousandths: 9 });
    guard.tryBegin(command);

    guard.finish(foreign);
    expect(guard.tryBegin(createMotivationCommand({ tenThousandths: 2 }))).toBe(
      false,
    );

    guard.finish(command);
    expect(guard.tryBegin(createMotivationCommand({ tenThousandths: 2 }))).toBe(
      true,
    );
  });

  it('keeps the blocked command out of the guard state', () => {
    const command: MotivationCommand<{ tenThousandths: number }> =
      createMotivationCommand({ tenThousandths: 1 });
    guard.tryBegin(command);
    guard.finish(command);

    expect(guard.inFlightKey()).toBeNull();
  });
});
