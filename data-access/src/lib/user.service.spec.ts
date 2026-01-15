import { HttpClient, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { User } from '@sotbi/models';
import { of } from 'rxjs';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpClient: jest.Mocked<HttpClient>;

  const mockUser = {
    id: 1,
    uuid: new Uint16Array([]),
    user: 'test.user',
    avatar: 'avatar.jpg',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    hired: new Date('2023-01-01'),
    fired: new Date('2025-12-31'),
    password: 'hashedpassword',
    data: new Date('2023-01-01'),
    role: 1,
    user_group_id: 1,
    group: {
      id: 1,
      name: 'User',
      label: 'Regular User',
      level: 2,
      home: '/dashboard',
    },
    position_id: 1,
    users_positions: [],
    unit1_id: 1,
    unit1: 'Finance',
    unit2_id: 1,
    unit2: 'Payments',
    settings: 0,
    staff_type: 1,
    update_at: new Date('2023-01-01'),
    updated_by: 1,
    create_at: new Date('2023-01-01'),
    created_by: 1,
    debtors: new Uint32Array([1, 2, 3]),
  } as unknown as User;

  const mockUser2 = {
    ...mockUser,
    id: 2,
    user: 'test.user2',
    name: 'Test User 2',
  } as unknown as User;

  const mockUsers = [mockUser, mockUser2] as unknown as User[];

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    await TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }, UserService],
    }).compileComponents();

    service = TestBed.inject(UserService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/user');
  });

  describe('getAll', () => {
    it('should fetch all users with no filters (success path)', () => {
      httpClient.get.mockReturnValue(of(mockUsers));

      service.getAll().subscribe((result) => {
        expect(result).toEqual(mockUsers);
        expect(result.length).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/users', {
        params: new HttpParams(),
      });
    });

    it('should fetch users with position filter', () => {
      const positions = [1, 2];
      httpClient.get.mockReturnValue(of([mockUser]));

      service.getAll(positions).subscribe((result) => {
        expect(result).toEqual([mockUser]);
      });

      const expectedParams = new HttpParams()
        .append('pos', '1')
        .append('pos', '2');
      expect(httpClient.get).toHaveBeenCalledWith('/api/users', {
        params: expectedParams,
      });
    });

    it('should fetch users with exclusion filter', () => {
      const exclusions = [3, 4];
      httpClient.get.mockReturnValue(of(mockUsers));

      service.getAll([], exclusions).subscribe((result) => {
        expect(result).toEqual(mockUsers);
      });

      const expectedParams = new HttpParams()
        .append('excl', '3')
        .append('excl', '4');
      expect(httpClient.get).toHaveBeenCalledWith('/api/users', {
        params: expectedParams,
      });
    });

    it('should fetch users including fired ones', () => {
      httpClient.get.mockReturnValue(of(mockUsers));

      service.getAll([], [], true).subscribe((result) => {
        expect(result).toEqual(mockUsers);
      });

      const expectedParams = new HttpParams().set('fired', '1');
      expect(httpClient.get).toHaveBeenCalledWith('/api/users', {
        params: expectedParams,
      });
    });

    it('should prioritize position filter over exclusion filter', () => {
      const positions = [1, 2];
      const exclusions = [3, 4];
      httpClient.get.mockReturnValue(of([mockUser]));

      service.getAll(positions, exclusions).subscribe((result) => {
        expect(result).toEqual([mockUser]);
      });

      // Should only use position filter, not exclusion
      const expectedParams = new HttpParams()
        .append('pos', '1')
        .append('pos', '2');
      expect(httpClient.get).toHaveBeenCalledWith('/api/users', {
        params: expectedParams,
      });
    });

    it('should combine fired filter with position filter', () => {
      const positions = [1];
      httpClient.get.mockReturnValue(of([mockUser]));

      service.getAll(positions, [], true).subscribe((result) => {
        expect(result).toEqual([mockUser]);
      });

      const expectedParams = new HttpParams()
        .set('fired', '1')
        .append('pos', '1');
      expect(httpClient.get).toHaveBeenCalledWith('/api/users', {
        params: expectedParams,
      });
    });

    it('should return observable with users', () => {
      httpClient.get.mockReturnValue(of(mockUsers));

      const result = service.getAll();

      expect(result).toBeDefined();
      result.subscribe((users) => {
        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0].id).toBeDefined();
        expect(users[0].user).toBeDefined();
      });
    });
  });

  describe('get', () => {
    it('should fetch user by ID (success path)', () => {
      const userId = 1;
      httpClient.get.mockReturnValue(of(mockUser));

      service.get(userId).subscribe((result) => {
        expect(result).toEqual(mockUser);
        expect(result.id).toBe(userId);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/user/1');
    });

    it('should fetch different user by different ID', () => {
      const userId = 2;
      httpClient.get.mockReturnValue(of(mockUser2));

      service.get(userId).subscribe((result) => {
        expect(result.id).toBe(2);
        expect(result.user).toBe('test.user2');
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/user/2');
    });

    it('should return observable with user', () => {
      httpClient.get.mockReturnValue(of(mockUser));

      const result = service.get(1);

      expect(result).toBeDefined();
      result.subscribe((user) => {
        expect(user).toBeDefined();
        expect(user.id).toBe(1);
        expect(user.user).toBe('test.user');
      });
    });
  });

  describe('create', () => {
    it('should create a new user', () => {
      const newUser: Partial<User> = { user: 'new.user', name: 'New User' };
      httpClient.post.mockReturnValue(of(mockUser));

      service.create(newUser).subscribe((result: User) => {
        expect(result).toEqual(mockUser);
        expect(result.id).toBe(1);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/api/user', {
        ...newUser,
        user: 'new.user', // trimmed
      });
    });

    it('should trim username when creating user', () => {
      const newUser: Partial<User> = { user: '  spaced.user  ' };
      httpClient.post.mockReturnValue(of(mockUser));

      service.create(newUser).subscribe();

      const callArgs = httpClient.post.mock.calls[0][1] as Partial<User>;
      expect(callArgs.user).toBe('spaced.user');
    });
  });

  describe('save', () => {
    it('should update existing user by ID', () => {
      const userId = 1;
      const updates: Partial<User> = { name: 'Updated Name' };
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      } as unknown as User;
      httpClient.put.mockReturnValue(of(updatedUser));

      service.save(userId, updates).subscribe((result: User) => {
        expect(result.name).toBe('Updated Name');
      });

      expect(httpClient.put).toHaveBeenCalledWith('/api/user/1', updates);
    });

    it('should save user with new email', () => {
      const updates: Partial<User> = { email: 'newemail@example.com' };
      httpClient.put.mockReturnValue(of(mockUser));

      service.save(1, updates).subscribe();

      expect(httpClient.put).toHaveBeenCalledWith('/api/user/1', updates);
    });
  });

  describe('fire', () => {
    it('should fire user by ID', () => {
      const userId = 1;
      httpClient.patch.mockReturnValue(of(mockUser));

      service.fire(userId).subscribe((result: User) => {
        expect(result).toEqual(mockUser);
      });

      expect(httpClient.patch).toHaveBeenCalledWith(
        '/api/user/1',
        expect.objectContaining({ fire: expect.any(Date) })
      );
    });

    it('should fire different user', () => {
      const userId = 42;
      httpClient.patch.mockReturnValue(of(mockUser2));

      service.fire(userId).subscribe();

      expect(httpClient.patch).toHaveBeenCalledWith(
        '/api/user/42',
        expect.any(Object)
      );
    });
  });

  // TODO: Uncomment and migrate these test suites one by one

  /*

  describe('getAllShort', () => {
    // Tests for getting short user list
  });

  describe('GetShort', () => {
    // Tests for getting single short user
  });

  describe('getShort', () => {
    // Tests for getting user short info
  });

  describe('getByUnit', () => {
    // Tests for getting users by unit
  });

  describe('getByPosition', () => {
    // Tests for getting users by position
  });

  describe('getByProject', () => {
    // Tests for getting users by project
  });

  describe('getHiredUsers', () => {
    // Tests for getting hired users
  });

  describe('getHeadDepartment', () => {
    // Tests for getting department heads
  });

  describe('getFullNameByUserId', () => {
    // Tests for getting full name by ID
  });

  describe('getUsersByGroup', () => {
    // Tests for getting users by group
  });

  describe('GetUserLink', () => {
    // Tests for getting user links
  });

  describe('GetUserAvatar', () => {
    // Tests for getting user avatars
  });

  describe('UpdateAvatar', () => {
    // Tests for updating avatar
  });

  describe('getStructTree', () => {
    // Tests for getting structure tree
  });

  describe('GetCostReal', () => {
    // Tests for getting real cost
  });

  describe('updatePassword', () => {
    // Tests for updating password
  });

  describe('loginAs', () => {
    // Tests for login as user
  });

  describe('CheckUUID', () => {
    // Tests for checking UUID
  });

  describe('Error Handling', () => {
    // Tests for error scenarios
  });

  describe('Integration Tests', () => {
    // Integration test scenarios
  });
  */
});
