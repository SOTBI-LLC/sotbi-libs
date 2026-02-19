import { TestBed } from '@angular/core/testing';
import type { CanDeactivateFn } from '@angular/router';

import type { CanComponentDeactivate } from './deactivate.guard';
import { deactivateGuard } from './deactivate.guard';

describe('canDeactivateGuard', () => {
  const executeGuard: CanDeactivateFn<CanComponentDeactivate> = (
    ...guardParameters
  ) => TestBed.runInInjectionContext(() => deactivateGuard(...guardParameters));
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
