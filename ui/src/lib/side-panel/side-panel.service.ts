import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Injector,
  inject,
  type Type,
} from '@angular/core';
import {
  SIDE_PANEL_CONFIG,
  SIDE_PANEL_DATA,
  type SidePanelConfig,
} from './side-panel-config';
import { SidePanelRef } from './side-panel-ref';
import { restorePanelFocus } from './side-panel-focus';

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private readonly app = inject(ApplicationRef);
  private readonly environment = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  public open<T, D = unknown, R = unknown>(
    component: Type<T>,
    config: Partial<SidePanelConfig<D>> = {},
  ): SidePanelRef<T, R> {
    const panel = new SidePanelRef<T, R>();
    const initiator = this.document.activeElement as HTMLElement | null;
    const elementInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: SIDE_PANEL_DATA, useValue: config.data },
        { provide: SIDE_PANEL_CONFIG, useValue: config },
        { provide: SidePanelRef, useValue: panel },
      ],
    });
    const content = createComponent(component, {
      environmentInjector: this.environment,
      elementInjector,
    });
    const host = content.location.nativeElement as HTMLElement;
    panel.componentInstance = content.instance;
    this.document.body.appendChild(host);
    this.app.attachView(content.hostView);
    panel.closed.subscribe(() => {
      this.app.detachView(content.hostView);
      content.destroy();
      elementInjector.destroy();
      host.remove();
      restorePanelFocus(this.document, initiator);
    });
    try {
      content.changeDetectorRef.detectChanges();
    } catch (error) {
      this.app.detachView(content.hostView);
      content.destroy();
      elementInjector.destroy();
      host.remove();
      throw error;
    }
    return panel;
  }
}
