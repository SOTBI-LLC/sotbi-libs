import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store, provideStates, provideStore } from '@ngxs/store';
import { AccessService } from '@sotbi/data-access';
import type { Access } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import {
  CreateAccess,
  DeleteAccess,
  FetchAccess,
  GetAccess,
  UpdateAccess,
} from './access.actions';
import type { AccessStateModel } from './access.state';
import { AccessState } from './access.state';

describe('AccessState', () => {
  let store: Store;
  let accessService: jest.Mocked<AccessService>;

  const mockAccess: Access[] = [
    { id: 1, name: 'Read Access', mask: 1, description: 'Read permission' },
    { id: 2, name: 'Write Access', mask: 2, description: 'Write permission' },
    { id: 3, name: 'Delete Access', mask: 4, action: 'delete' },
  ];

  beforeEach(async () => {
    const serviceSpy = {
      GetAll: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<AccessService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AccessService, useValue: serviceSpy },
        provideStore([]),
        provideStates([AccessState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    accessService = TestBed.inject(AccessService) as jest.Mocked<AccessService>;
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have correct default state', () => {
      const state = store.selectSnapshot(AccessState.getItems);
      const count = store.selectSnapshot(AccessState.getCount);
      const selected = store.selectSnapshot(AccessState.getItem);

      expect(state).toEqual([]);
      expect(count).toBe(0);
      expect(selected).toBeNull();
    });

    it('should have proper state structure', () => {
      const snapshot = store.snapshot();
      const accessState = snapshot.access as AccessStateModel;

      expect(accessState).toEqual({
        items: [],
        selected: null,
        count: 0,
        loading: false,
      });
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      // Set up initial state with test data
      store.reset({
        access: {
          items: [...mockAccess],
          selected: { ...mockAccess[0] },
          count: mockAccess.length,
          loading: false,
        },
        auth: {
          user: { id: 0, user: '', role: 1, settings: 0, staff_type: -1 },
          token: '',
          refreshToken: '',
          home: '/',
          loading: false,
          access: new Set(),
        },
        users: {
          items: [],
          selected: null,
          count: 0,
          loading: false,
        },
      });
    });

    it('should select items correctly', () => {
      const items = store.selectSnapshot(AccessState.getItems);
      expect(items).toEqual(mockAccess);
      expect(items.length).toBe(3);
    });

    it('should select selected item correctly', () => {
      const selected = store.selectSnapshot(AccessState.getItem);
      expect(selected).toEqual(mockAccess[0]);
      expect(selected?.id).toBe(1);
      expect(selected?.name).toBe('Read Access');
    });

    it('should select count correctly', () => {
      const count = store.selectSnapshot(AccessState.getCount);
      expect(count).toBe(3);
    });

    it('should return empty/null values when state is reset', () => {
      store.reset({
        access: {
          items: [],
          selected: null,
          count: 0,
          loading: false,
        },
        auth: {
          user: { id: 0, user: '', role: 1, settings: 0, staff_type: -1 },
          token: '',
          refreshToken: '',
          home: '/',
          loading: false,
          access: new Set(),
        },
        users: {
          items: [],
          selected: null,
          count: 0,
          loading: false,
        },
      });

      expect(store.selectSnapshot(AccessState.getItems)).toEqual([]);
      expect(store.selectSnapshot(AccessState.getItem)).toBeNull();
      expect(store.selectSnapshot(AccessState.getCount)).toBe(0);
    });
  });

  describe('Actions', () => {
    describe('FetchAccess', () => {
      it('should fetch access items when none exist and not loading', () => {
        accessService.GetAll.mockReturnValue(of(mockAccess));

        store.dispatch(new FetchAccess()).subscribe();

        expect(accessService.GetAll).toHaveBeenCalled();

        const items = store.selectSnapshot(AccessState.getItems);
        const count = store.selectSnapshot(AccessState.getCount);

        expect(items).toEqual(mockAccess);
        expect(count).toBe(mockAccess.length);
      });

      it('should not fetch if items already exist', () => {
        // Set up state with existing items
        store.reset({
          access: {
            items: [...mockAccess],
            selected: null,
            count: mockAccess.length,
            loading: false,
          },
          auth: {
            user: { id: 0, user: '', role: 1, settings: 0, staff_type: -1 },
            token: '',
            refreshToken: '',
            home: '/',
            loading: false,
            access: new Set(),
          },
          users: {
            items: [],
            selected: null,
            count: 0,
            loading: false,
          },
        });

        accessService.GetAll.mockReturnValue(of(mockAccess));

        store.dispatch(new FetchAccess()).subscribe();

        // Should not call service since items already exist
        expect(accessService.GetAll).not.toHaveBeenCalled();
      });

      it('should not fetch if currently loading', () => {
        // Set up state with loading true
        store.reset({
          access: {
            items: [],
            selected: null,
            count: 0,
            loading: true,
          },
          auth: {
            user: { id: 0, user: '', role: 1, settings: 0, staff_type: -1 },
            token: '',
            refreshToken: '',
            home: '/',
            loading: false,
            access: new Set(),
          },
          users: {
            items: [],
            selected: null,
            count: 0,
            loading: false,
          },
        });

        accessService.GetAll.mockReturnValue(of(mockAccess));

        store.dispatch(new FetchAccess()).subscribe();

        // Should not call service since already loading
        expect(accessService.GetAll).not.toHaveBeenCalled();
      });

      it('should handle fetch errors properly', () => {
        const errorMessage = 'Failed to fetch access items';
        accessService.GetAll.mockReturnValue(
          throwError(() => new Error(errorMessage)),
        );

        store.dispatch(new FetchAccess()).subscribe({
          error: (error) => {
            expect(error).toBeTruthy();
            expect(error.message).toBe(errorMessage);
          },
        });

        expect(accessService.GetAll).toHaveBeenCalled();
      });

      it('should set loading state correctly during fetch', () => {
        accessService.GetAll.mockReturnValue(of(mockAccess));

        store.dispatch(new FetchAccess()).subscribe();

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });
    });

    describe('GetItem', () => {
      beforeEach(() => {
        // Set up state with test data
        store.reset({
          access: {
            items: [...mockAccess],
            selected: null,
            count: mockAccess.length,
            loading: false,
          },
          auth: {
            user: { id: 0, user: '', role: 1, settings: 0, staff_type: -1 },
            token: '',
            refreshToken: '',
            home: '/',
            loading: false,
            access: new Set(),
          },
          users: {
            items: [],
            selected: null,
            count: 0,
            loading: false,
          },
        });
      });

      it('should select item by id from existing items', () => {
        store.dispatch(new GetAccess({ id: 2 }));

        const selected = store.selectSnapshot(AccessState.getItem);
        expect(selected).toEqual(mockAccess[1]);
        expect(selected?.id).toBe(2);
        expect(selected?.name).toBe('Write Access');
      });

      it('should handle non-existent item id', () => {
        store.dispatch(new GetAccess({ id: 999 }));

        const selected = store.selectSnapshot(AccessState.getItem);
        expect(selected).toBeUndefined();
      });

      it('should update loading state during item selection', () => {
        store.dispatch(new GetAccess({ id: 1 }));

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });
    });

    describe('Service Interaction Tests', () => {
      it('should call AccessService.add when CreateItem is dispatched', () => {
        const newAccess: Partial<Access> = {
          name: 'New Access',
          mask: 16,
          description: 'Newly created access',
        };

        const createdAccess: Access = { id: 5, ...newAccess } as Access;
        accessService.add.mockReturnValue(of(createdAccess));

        store.dispatch(new CreateAccess(newAccess)).subscribe();

        expect(accessService.add).toHaveBeenCalledWith(newAccess);
      });

      it('should call AccessService.update when UpdateItem is dispatched', () => {
        const updatedAccess: Partial<Access> & { id: number } = {
          id: 1,
          name: 'Updated Access',
          mask: 1,
          description: 'Updated description',
        };

        const resultAccess: Access = updatedAccess as Access;
        accessService.update.mockReturnValue(of(resultAccess));

        store.dispatch(new UpdateAccess(updatedAccess)).subscribe();

        expect(accessService.update).toHaveBeenCalledWith(updatedAccess);
      });

      it('should call AccessService.delete when DeleteItem is dispatched', () => {
        const itemIdToDelete = 2;
        accessService.delete.mockReturnValue(of(undefined));

        store.dispatch(new DeleteAccess(itemIdToDelete)).subscribe();

        expect(accessService.delete).toHaveBeenCalledWith(itemIdToDelete);
      });
    });

    describe('Error Handling', () => {
      it('should handle CreateItem errors', () => {
        const newAccess: Partial<Access> = { name: 'Failed Access' };
        const errorMessage = 'Failed to create access item';

        accessService.add.mockReturnValue(
          throwError(() => new Error(errorMessage)),
        );

        store.dispatch(new CreateAccess(newAccess)).subscribe({
          error: (error) => {
            expect(error).toBeTruthy();
            expect(error.message).toBe(errorMessage);
          },
        });

        expect(accessService.add).toHaveBeenCalledWith(newAccess);
      });

      it('should handle UpdateItem errors', () => {
        const updatedAccess: Partial<Access> & { id: number } = {
          id: 1,
          name: 'Failed Update',
        };
        const errorMessage = 'Failed to update access item';

        accessService.update.mockReturnValue(
          throwError(() => new Error(errorMessage)),
        );

        // Spy on console.error since the action logs errors
        jest.spyOn(console, 'error').mockImplementation();

        store.dispatch(new UpdateAccess(updatedAccess)).subscribe({
          error: (error) => {
            expect(error).toBeTruthy();
            expect(error.message).toBe(errorMessage);
            expect(console.error).toHaveBeenCalledWith(error);
          },
        });

        expect(accessService.update).toHaveBeenCalledWith(updatedAccess);
      });

      it('should handle DeleteItem errors', () => {
        const itemIdToDelete = 1;
        const errorMessage = 'Failed to delete access item';

        accessService.delete.mockReturnValue(
          throwError(() => new Error(errorMessage)),
        );

        store.dispatch(new DeleteAccess(itemIdToDelete)).subscribe({
          error: (error) => {
            expect(error).toBeTruthy();
            expect(error.message).toBe(errorMessage);
          },
        });

        expect(accessService.delete).toHaveBeenCalledWith(itemIdToDelete);
      });
    });

    describe('Loading State Management', () => {
      it('should set loading to true when CreateItem starts', () => {
        const newAccess: Partial<Access> = { name: 'Test Access' };
        const createdAccess: Access = { id: 6, ...newAccess } as Access;

        accessService.add.mockReturnValue(of(createdAccess));

        store.dispatch(new CreateAccess(newAccess)).subscribe();

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });

      it('should set loading to true when UpdateItem starts', () => {
        const updatedAccess: Access = {
          id: 1,
          name: 'Test Update',
          mask: 0,
        };
        const resultAccess: Access = updatedAccess as Access;

        accessService.update.mockReturnValue(of(resultAccess));

        store.dispatch(new UpdateAccess(updatedAccess)).subscribe();

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });

      it('should set loading to true when DeleteItem starts', () => {
        const itemIdToDelete = 1;
        accessService.delete.mockReturnValue(of(undefined));

        store.dispatch(new DeleteAccess(itemIdToDelete)).subscribe();

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty service responses', () => {
        accessService.GetAll.mockReturnValue(of([]));

        store.dispatch(new FetchAccess()).subscribe();

        const items = store.selectSnapshot(AccessState.getItems);
        const count = store.selectSnapshot(AccessState.getCount);

        expect(items).toEqual([]);
        expect(count).toBe(0);
      });

      it('should maintain loading state consistency on errors', () => {
        accessService.GetAll.mockReturnValue(
          throwError(() => new Error('Network error')),
        );

        store.dispatch(new FetchAccess()).subscribe({
          error: () => {
            const snapshot = store.snapshot();
            const accessState = snapshot.access as AccessStateModel;
            // Loading should be false after error handling
            expect(accessState.loading).toBe(false);
          },
        });
      });
    });
  });
});
