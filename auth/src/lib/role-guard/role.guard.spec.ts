import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideStates, provideStore } from '@ngxs/store';
import { UserService } from '@sotbi/data-access';
import { AuthState } from '../store/auth.state';
import { RoleGuard } from './role.guard';

describe('RoleGuardGuard', () => {
  let guard: RoleGuard;

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
    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
