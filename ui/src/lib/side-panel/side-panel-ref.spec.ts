import { SidePanelRef } from './side-panel-ref';

describe('SidePanelRef completion', () => {
  it('distinguishes success without a payload from cancellation and emits once', () => {
    const panel = new SidePanelRef();
    const outcomes: unknown[] = [];
    panel.closed.subscribe((outcome) => outcomes.push(outcome));
    panel.complete(undefined);
    panel.complete('duplicate');
    expect(outcomes).toEqual([{ kind: 'success', value: undefined }]);
  });
});

describe('SidePanelRef close policy', () => {
  it('keeps a dirty panel open after declining and blocks closing during saving', async () => {
    const panel = new SidePanelRef();
    let saving = false;
    let discard = false;
    const outcomes: unknown[] = [];
    panel.closed.subscribe((outcome) => outcomes.push(outcome));
    panel.setState({ dirty: () => true, blocked: () => saving });
    panel.setConfirmation(async () => discard);
    await panel.requestClose();
    expect(outcomes).toEqual([]);
    saving = true;
    discard = true;
    await panel.requestClose();
    expect(outcomes).toEqual([]);
    saving = false;
    await panel.requestClose();
    expect(outcomes).toEqual([{ kind: 'cancelled' }]);
  });
});
