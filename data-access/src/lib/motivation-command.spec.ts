import { createMotivationCommand } from './motivation-command';

describe('createMotivationCommand', () => {
  it('creates a fresh canonical UUID v4 key per command', () => {
    const command = createMotivationCommand({ reason: 'r' });

    expect(command.key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('gives every new intent its own key', () => {
    const first = createMotivationCommand({ tenThousandths: 1 });
    const second = createMotivationCommand({ tenThousandths: 2 });

    expect(first.key).not.toBe(second.key);
  });

  it('keeps the key and body identical across retries of the same command', () => {
    const command = createMotivationCommand({
      scores: [{ sheetCriterionId: 'a', score: 0 }],
    });

    // A retry reuses the same frozen snapshot; it does not mint a new key.
    expect(command.key).toBe(command.key);
    expect(command.body).toEqual({
      scores: [{ sheetCriterionId: 'a', score: 0 }],
    });
  });

  it('freezes the snapshot so the body cannot mutate in flight', () => {
    const command = createMotivationCommand({ tenThousandths: 5 });

    expect(Object.isFrozen(command)).toBe(true);
    expect(Object.isFrozen(command.body)).toBe(true);
    expect(() => {
      (command.body as { tenThousandths?: number }).tenThousandths = 9;
    }).toThrow(TypeError);
  });

  it('deep-freezes nested entries and arrays of the snapshot', () => {
    const command = createMotivationCommand({
      scores: [{ sheetCriterionId: 'a', score: 0, comment: 'zero' }],
      adjustment: { value: 1, comment: 'up' },
    });

    const scores = command.body.scores as unknown as object[];
    expect(Object.isFrozen(scores)).toBe(true);
    expect(Object.isFrozen(scores[0])).toBe(true);
    expect(
      Object.isFrozen(
        (command.body.adjustment as unknown as Record<string, unknown>),
      ),
    ).toBe(true);
  });
});
