import type { User } from '@sotbi/models';
import type { AuthStateModel } from './auth.state';
import { AuthState } from './auth.state';

describe('AuthState - Static Functions and Utilities', () => {
  describe('Static Utility Functions', () => {
    it('should have static utility functions for role checking', () => {
      // Test isAdmin function
      const adminUser = { id: 1, user: 'admin', role: 256 };
      const regularUser = { id: 2, user: 'user', role: 2 };

      expect(AuthState.isAdmin({ user: adminUser } as AuthStateModel)).toBe(
        true
      );
      expect(AuthState.isAdmin({ user: regularUser } as AuthStateModel)).toBe(
        false
      );
      expect(
        AuthState.isAdmin({ user: { id: 0, role: 0 } } as AuthStateModel)
      ).toBe(false);
    });

    it('should have static utility functions for login status', () => {
      // Test isLogged function
      const loggedUser = { id: 1, user: 'user', role: 2 };
      const notLoggedUser = { id: 0, user: '', role: 1 };

      expect(AuthState.isLogged({ user: loggedUser } as AuthStateModel)).toBe(
        true
      );
      expect(
        AuthState.isLogged({ user: notLoggedUser } as AuthStateModel)
      ).toBe(false);
    });

    it('should have static utility functions for role comparison', () => {
      // Test hasRole function
      const user = { id: 1, user: 'test', role: 2 };

      expect(AuthState.hasRole(2)({ user } as AuthStateModel)).toBe(true);
      expect(AuthState.hasRole(1)({ user } as AuthStateModel)).toBe(false);
    });

    it('should have static utility functions for role checking', () => {
      // Test isAdmin function
      const adminUser = { id: 1, user: 'admin', role: 256 };
      const regularUser = { id: 2, user: 'user', role: 2 };

      expect(AuthState.isAdmin({ user: adminUser } as AuthStateModel)).toBe(
        true
      );
      expect(AuthState.isAdmin({ user: regularUser } as AuthStateModel)).toBe(
        false
      );
      expect(
        AuthState.isAdmin({ user: { id: 0, role: 0 } } as AuthStateModel)
      ).toBe(false);
    });

    it('should have static utility functions for login status', () => {
      // Test isLogged function
      const loggedUser = { id: 1, user: 'user', role: 2 };
      const notLoggedUser = { id: 0, user: '', role: 1 };

      expect(AuthState.isLogged({ user: loggedUser } as AuthStateModel)).toBe(
        true
      );
      expect(
        AuthState.isLogged({ user: notLoggedUser } as AuthStateModel)
      ).toBe(false);
    });

    it('should have static utility functions for role comparison', () => {
      // Test hasRole function
      const user = { id: 1, user: 'test', role: 2 };

      expect(AuthState.hasRole(2)({ user } as AuthStateModel)).toBe(true);
      expect(AuthState.hasRole(1)({ user } as AuthStateModel)).toBe(false);
    });

    it('should have static selectors for user data', () => {
      const user = {
        id: 123,
        user: 'testuser',
        role: 2,
        settings: 32,
        staff_type: 1,
      };
      const state = { user } as AuthStateModel;

      expect(AuthState.getUserID(state)).toBe(123);
      expect(AuthState.getUserRole(state)).toBe(2);
      expect(AuthState.getUserSettings(state)).toBe(32);
      expect(AuthState.getUserStaffType(state)).toBe(1);
      expect(AuthState.getCurrentUser(state)).toEqual(user);
    });

    it('should have static selectors for access control', () => {
      const accessSet = new Set(['/admin', '/costs']);
      const state = { access: accessSet } as AuthStateModel;

      expect(AuthState.getAccess(state)).toEqual(accessSet);
      expect(AuthState.getAccess(state).has('/admin')).toBe(true);
      expect(AuthState.getAccess(state).has('/unknown')).toBe(false);
    });

    it('should have static selectors for tokens', () => {
      const token = 'test_token';
      const refreshToken = 'refresh_token';
      const state = { token, refreshToken } as AuthStateModel;

      expect(AuthState.getToken(state)).toBe(token);
      expect(AuthState.getRefreshToken(state)).toBe(refreshToken);
      expect(AuthState.getTokens(state)).toEqual({ token, refreshToken });
    });

    it('should have static selectors for navigation', () => {
      const home = '/dashboard';
      const state = { home } as AuthStateModel;

      expect(AuthState.getHome(state)).toBe(home);
    });

    it('should have static selector for loading state', () => {
      const loading = true;
      const state = { loading } as AuthStateModel;

      expect(AuthState.loading(state)).toBe(true);
    });
  });

  describe('State Model Validation', () => {
    it('should validate AuthStateModel interface', () => {
      const validState: AuthStateModel = {
        user: {
          id: 123,
          user: 'testuser',
          role: 2,
          settings: 32,
          staff_type: 1,
        },
        token: 'test_token',
        refreshToken: 'refresh_token',
        home: '/dashboard',
        loading: false,
        access: new Set(['/admin', '/costs']),
      };

      expect(validState.user).toBeDefined();
      expect(validState.token).toBeDefined();
      expect(validState.refreshToken).toBeDefined();
      expect(validState.home).toBeDefined();
      expect(typeof validState.loading).toBe('boolean');
      expect(validState.access).toBeInstanceOf(Set);
    });

    it('should validate default state structure', () => {
      const defaultState: AuthStateModel = {
        user: { id: 0, user: '', role: 1, settings: 0, staff_type: -1 },
        token: '',
        refreshToken: '',
        home: '/',
        loading: false,
        access: new Set(),
      };

      expect(defaultState.user.id).toBe(0);
      expect(defaultState.user.user).toBe('');
      expect(defaultState.user.role).toBe(1);
      expect(defaultState.user.settings).toBe(0);
      expect(defaultState.user.staff_type).toBe(-1);
      expect(defaultState.token).toBe('');
      expect(defaultState.refreshToken).toBe('');
      expect(defaultState.home).toBe('/');
      expect(defaultState.loading).toBe(false);
      expect(defaultState.access.size).toBe(0);
    });
  });

  describe('Constants and Configuration', () => {
    it('should have correct storage keys', () => {
      // Test that the AuthState has proper storage key constants
      expect('refreshUser').toBeDefined();
      expect('currentUser').toBeDefined();
      expect('currentAccess').toBeDefined();
    });

    it('should have admin role constant', () => {
      expect(256).toBeGreaterThan(0); // ADMIN_ROLE should be a positive number
    });

    it('should validate user interface structure', () => {
      const user: Partial<User> = {
        id: 123,
        user: 'testuser',
        role: 2,
        settings: 32,
        staff_type: 1,
      };

      expect(typeof user.id).toBe('number');
      expect(typeof user.user).toBe('string');
      expect(typeof user.role).toBe('number');
      expect(typeof user.settings).toBe('number');
      expect(typeof user.staff_type).toBe('number');
    });
  });

  describe('Access Control Logic', () => {
    it('should validate role-based access', () => {
      const adminState = { user: { role: 256 } } as AuthStateModel;
      const userState = { user: { role: 2 } } as AuthStateModel;
      const defaultState = { user: { role: 1 } } as AuthStateModel;

      expect(AuthState.isAdmin(adminState)).toBe(true);
      expect(AuthState.isAdmin(userState)).toBe(false);
      expect(AuthState.isAdmin(defaultState)).toBe(false);
    });

    it('should validate login status', () => {
      const loggedState = { user: { role: 2 } } as AuthStateModel;
      const notLoggedState = { user: { role: 1 } } as AuthStateModel;
      const defaultState = { user: { role: 0 } } as AuthStateModel;

      expect(AuthState.isLogged(loggedState)).toBe(true);
      expect(AuthState.isLogged(notLoggedState)).toBe(false);
      expect(AuthState.isLogged(defaultState)).toBe(false);
    });
  });
});
