import { DOCUMENT } from '@angular/common';
import { Overlay, type ScrollStrategy } from '@angular/cdk/overlay';
import { Injectable, inject } from '@angular/core';

/** Shares CDK's scroll lock across stacked modals, including out-of-order close. */
@Injectable({ providedIn: 'root' })
export class DialogScrollService {
  private readonly document = inject(DOCUMENT);
  private readonly overlay = inject(Overlay);
  private readonly block = this.overlay.scrollStrategies.block();
  private locks = 0;
  private ownedClass = false;

  public strategy(block: boolean): ScrollStrategy {
    if (!block) return this.overlay.scrollStrategies.noop();
    let enabled = false;
    return {
      attach: () => {
        // CDK block strategy needs no overlay-specific attachment.
      },
      enable: () => {
        if (enabled) return;
        enabled = true;
        if (this.locks++ === 0) {
          this.ownedClass =
            !this.document.body.classList.contains('no-scrolling');
          this.document.body.classList.add('no-scrolling');
          this.block.enable();
        }
      },
      disable: () => {
        if (!enabled) return;
        enabled = false;
        if (--this.locks === 0) {
          this.block.disable();
          if (this.ownedClass)
            this.document.body.classList.remove('no-scrolling');
        }
      },
    };
  }
}
