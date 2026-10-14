import { InjectionToken } from '@angular/core';

export type SidePanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'full-screen';
export class SidePanelConfig<D = unknown> {
  public data?: D;
  public size: SidePanelSize = 'md';
}
export const SIDE_PANEL_DATA = new InjectionToken<unknown>('SIDE_PANEL_DATA');
export const SIDE_PANEL_CONFIG = new InjectionToken<SidePanelConfig>(
  'SIDE_PANEL_CONFIG',
);
