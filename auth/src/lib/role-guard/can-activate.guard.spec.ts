import { TestBed } from '@angular/core/testing';
import type { CanActivateFn } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideStates, provideStore } from '@ngxs/store';
import { AuthState } from '../store/auth.state';
import { canActivateGuard } from './can-activate.guard';

describe('canLoadGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canActivateGuard(...guardParameters));

  const httpClientSpy = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpClientSpy },
        provideStore([]),
        provideStates([AuthState]),
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
