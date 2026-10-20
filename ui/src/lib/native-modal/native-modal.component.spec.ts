import { Dialog } from '@angular/cdk/dialog';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NativeModalComponent } from './native-modal.component';

@Component({
  imports: [NativeModalComponent],
  template: `<button id="initiator">Open</button>
    <sotbi-modal
      [(open)]="first"
      [preventClose]="blocked()"
      [closable]="!blocked()"
      [staticBackdrop]="staticBackdrop()"
      (openChange)="changes.push($event)"
      (alternateClose)="alternate = alternate + 1"
    >
      <h2 class="modal-title">First</h2>
      <div class="modal-body"><input id="first-input" value="draft" /></div>
      <div class="modal-footer"><button>Last action</button></div>
    </sotbi-modal>
    <sotbi-modal [(open)]="second"
      ><h2 class="modal-title">Second</h2>
      <div class="modal-body"><input id="second-input" /></div
    ></sotbi-modal>`,
})
class Host {
  public readonly first = signal(true);
  public readonly second = signal(false);
  public readonly blocked = signal(false);
  public readonly staticBackdrop = signal(true);
  public changes: boolean[] = [];
  public alternate = 0;
}

@Component({ template: '<button>Nested CDK dialog</button>' })
class Popup {}

describe('NativeModalComponent', () => {
  async function create() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }
  it('closes once after animation and removes the overlay and scroll lock', async () => {
    const fixture = await create();
    const close = document.querySelector<HTMLButtonElement>(
      '.modal-dialog .close',
    )!;
    close.click();
    close.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.first()).toBe(false);
    expect(fixture.componentInstance.changes).toEqual([false]);
    expect(document.querySelector('.sotbi-modal-pane')).toBeNull();
    expect(document.body.classList.contains('no-scrolling')).toBe(false);
    fixture.destroy();
  });
  it('honours static backdrop and alternate-close before the closable guard', async () => {
    const fixture = await create();
    const host = fixture.componentInstance;
    document.querySelector<HTMLButtonElement>('.modal-backdrop')!.click();
    await fixture.whenStable();
    expect(host.first()).toBe(true);
    host.blocked.set(true);
    await fixture.whenStable();
    expect(document.querySelector('.modal-dialog .close')).toBeNull();
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    await fixture.whenStable();
    expect(host.alternate).toBe(1);
    expect(host.first()).toBe(true);
    document.body.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }),
    );
    expect(host.alternate).toBe(1);
    host.blocked.set(false);
    host.staticBackdrop.set(false);
    await fixture.whenStable();
    document.querySelector<HTMLButtonElement>('.modal-backdrop')!.click();
    await fixture.whenStable();
    expect(host.first()).toBe(false);
    fixture.destroy();
  });
  it('uses one scroll lock across stacked windows and closes only the top on Escape', async () => {
    const fixture = await create();
    const host = fixture.componentInstance;
    host.second.set(true);
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    document.body.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();
    expect(host.second()).toBe(false);
    expect(host.first()).toBe(true);
    expect(document.body.classList.contains('no-scrolling')).toBe(true);
    host.second.set(true);
    await fixture.whenStable();
    host.first.set(false);
    await fixture.whenStable();
    expect(document.body.classList.contains('no-scrolling')).toBe(true);
    fixture.destroy();
    expect(document.querySelector('.sotbi-modal-pane')).toBeNull();
    expect(document.body.classList.contains('no-scrolling')).toBe(false);
  });
  it('keeps an externally reopened window mounted during its exit animation', async () => {
    const fixture = await create();
    const host = fixture.componentInstance;
    host.first.set(false);
    fixture.detectChanges();
    expect(document.querySelector('.sotbi-dialog-leaving')).not.toBeNull();
    host.first.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(document.querySelector('.sotbi-dialog-leaving')).toBeNull();
    expect(host.changes).toEqual([]);
    fixture.destroy();
  });

  it('cancels a notified close when the parent explicitly reopens it', async () => {
    const fixture = await create();
    const host = fixture.componentInstance;
    document.querySelector<HTMLButtonElement>('.modal-dialog .close')!.click();
    host.first.set(false);
    fixture.detectChanges();
    host.first.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.first()).toBe(true);
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(host.changes).toEqual([]);
    fixture.destroy();
  });

  it('yields Escape to a nested CDK modal popup', async () => {
    const fixture = await create();
    const popup = TestBed.inject(Dialog).open(Popup, {
      disableAnimations: true,
    });
    await fixture.whenStable();
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      keyCode: 27,
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(event);
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(fixture.componentInstance.first()).toBe(true);
    popup.close();
    fixture.destroy();
  });
});
