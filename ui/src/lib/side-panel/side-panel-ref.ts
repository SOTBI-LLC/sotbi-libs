import { signal } from '@angular/core';
import { ReplaySubject, map, type Observable } from 'rxjs';

export type SidePanelOutcome<R> =
  { kind: 'success'; value: R } | { kind: 'cancelled' };
export interface SidePanelState {
  dirty: () => boolean;
  blocked: () => boolean;
}

/** A single panel interaction. Successful completion is distinct from cancellation. */
export class SidePanelRef<T = unknown, R = unknown> {
  public componentInstance!: T;
  private readonly result = new ReplaySubject<SidePanelOutcome<R>>(1);
  private finished = false;
  private confirming = false;
  private readonly state = signal<SidePanelState>({
    dirty: () => false,
    blocked: () => false,
  });
  private confirm: () => Promise<boolean> = async () => false;
  public readonly closed: Observable<SidePanelOutcome<R>> =
    this.result.asObservable();

  public setState(state: SidePanelState): void {
    this.state.set(state);
  }
  public setConfirmation(confirm: () => Promise<boolean>): void {
    this.confirm = confirm;
  }
  public get blocked(): boolean {
    return this.state().blocked();
  }

  public async requestClose(): Promise<void> {
    if (this.finished || this.blocked || this.confirming) return;
    if (this.state().dirty()) {
      this.confirming = true;
      let discard: boolean;
      try {
        discard = await this.confirm();
      } finally {
        this.confirming = false;
      }
      if (!discard || this.blocked || this.finished) return;
    }
    this.finish({ kind: 'cancelled' });
  }

  public complete(value: R): void {
    this.finish({ kind: 'success', value });
  }

  /** Result stream for callers which refresh only after a successful operation. */
  public afterClosed(): Observable<R | undefined> {
    return this.closed.pipe(
      map((outcome) =>
        outcome.kind === 'success' ? outcome.value : undefined,
      ),
    );
  }

  private finish(outcome: SidePanelOutcome<R>): void {
    if (this.finished) return;
    this.finished = true;
    this.result.next(outcome);
    this.result.complete();
  }
}
