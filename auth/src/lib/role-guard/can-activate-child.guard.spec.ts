import { HttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { CanActivateChildFn } from '@angular/router';
import { provideStates, provideStore } from '@ngxs/store';
import { UserService } from '@sotbi/data-access';
import { AuthState } from '../store/auth.state';
import { canActivateChildGuard } from './can-activate-child.guard';

describe('canActivateChildGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      canActivateChildGuard(...guardParameters),
    );

  const userServiceSpy = {
    getAll: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    fire: jest.fn(),
    getUsersShort: jest.fn(),
    getHeadDepartment: jest.fn(),
  } as unknown as jest.Mocked<UserService>;

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
        { provide: UserService, useValue: userServiceSpy },
        provideStore([]),
        provideStates([AuthState]),
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
