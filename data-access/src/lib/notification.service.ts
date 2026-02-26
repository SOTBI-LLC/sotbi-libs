import { InjectionToken } from '@angular/core';

export const NOTIFICATION = new InjectionToken<NotificationService>(
  'NOTIFICATION',
);

export interface NotificationService {
  showError(message: string, duration?: number): void;
}
