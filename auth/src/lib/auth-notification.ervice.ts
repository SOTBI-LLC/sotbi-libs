import { InjectionToken } from '@angular/core';

export const AUTH_NOTIFICATION = new InjectionToken<AuthNotificationService>(
  'AUTH_NOTIFICATION',
);

export interface AuthNotificationService {
  showError(message: string, duration?: number): void;
}
