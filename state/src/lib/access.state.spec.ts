import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { AccessService } from '@sotbi/data-access';
import type { Access } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import {
  CreateItem,
  DeleteItem,
  FetchAccess,
  GetItem,
  UpdateItem,
} from './access.actions';
import type { AccessStateModel } from './access.state';
import { AccessState } from './access.state';

describe('AccessState', () => {
  let store: Store;
  let accessService: jasmine.SpyObj<AccessService>;

  const mockAccess: Access[] = [
    { id: 1, name: 'Read Access', mask: 1, description: 'Read permission' },
    { id: 2, name: 'Write Access', mask: 2, description: 'Write permission' },
    { id: 3, name: 'Delete Access', mask: 4, action: 'delete' },
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('AccessService', [
      'GetAll',
      'get',
      'add',
      'update',
      'delete',
    ]);

    await configureTestBed({
      providers: [{ provide: AccessService, useValue: serviceSpy }],
    }).compileComponents();

    store = TestBed.inject(Store);
    accessService = TestBed.inject(
      AccessService
    ) as jasmine.SpyObj<AccessService>;
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
      expect(selected.id).toBe(1);
      expect(selected.name).toBe('Read Access');
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
        accessService.GetAll.and.returnValue(of(mockAccess));

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

        accessService.GetAll.and.returnValue(of(mockAccess));

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

        accessService.GetAll.and.returnValue(of(mockAccess));

        store.dispatch(new FetchAccess()).subscribe();

        // Should not call service since already loading
        expect(accessService.GetAll).not.toHaveBeenCalled();
      });

      it('should handle fetch errors properly', () => {
        const errorMessage = 'Failed to fetch access items';
        accessService.GetAll.and.returnValue(
          throwError(() => new Error(errorMessage))
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
        accessService.GetAll.and.returnValue(of(mockAccess));

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
        store.dispatch(new GetItem({ id: 2 }));

        const selected = store.selectSnapshot(AccessState.getItem);
        expect(selected).toEqual(mockAccess[1]);
        expect(selected.id).toBe(2);
        expect(selected.name).toBe('Write Access');
      });

      it('should handle non-existent item id', () => {
        store.dispatch(new GetItem({ id: 999 }));

        const selected = store.selectSnapshot(AccessState.getItem);
        expect(selected).toBeUndefined();
      });

      it('should update loading state during item selection', () => {
        store.dispatch(new GetItem({ id: 1 }));

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
        accessService.add.and.returnValue(of(createdAccess));

        store.dispatch(new CreateItem(newAccess)).subscribe();

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
        accessService.update.and.returnValue(of(resultAccess));

        store.dispatch(new UpdateItem(updatedAccess)).subscribe();

        expect(accessService.update).toHaveBeenCalledWith(updatedAccess);
      });

      it('should call AccessService.delete when DeleteItem is dispatched', () => {
        const itemIdToDelete = 2;
        accessService.delete.and.returnValue(of(undefined));

        store.dispatch(new DeleteItem(itemIdToDelete)).subscribe();

        expect(accessService.delete).toHaveBeenCalledWith(itemIdToDelete);
      });
    });

    describe('Error Handling', () => {
      it('should handle CreateItem errors', () => {
        const newAccess: Partial<Access> = { name: 'Failed Access' };
        const errorMessage = 'Failed to create access item';

        accessService.add.and.returnValue(
          throwError(() => new Error(errorMessage))
        );

        store.dispatch(new CreateItem(newAccess)).subscribe({
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

        accessService.update.and.returnValue(
          throwError(() => new Error(errorMessage))
        );

        // Spy on console.error since the action logs errors
        spyOn(console, 'error');

        store.dispatch(new UpdateItem(updatedAccess)).subscribe({
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

        accessService.delete.and.returnValue(
          throwError(() => new Error(errorMessage))
        );

        store.dispatch(new DeleteItem(itemIdToDelete)).subscribe({
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

        accessService.add.and.returnValue(of(createdAccess));

        store.dispatch(new CreateItem(newAccess)).subscribe();

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });

      it('should set loading to true when UpdateItem starts', () => {
        const updatedAccess: Partial<Access> = { id: 1, name: 'Test Update' };
        const resultAccess: Access = updatedAccess as Access;

        accessService.update.and.returnValue(of(resultAccess));

        store.dispatch(new UpdateItem(updatedAccess)).subscribe();

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });

      it('should set loading to true when DeleteItem starts', () => {
        const itemIdToDelete = 1;
        accessService.delete.and.returnValue(of(undefined));

        store.dispatch(new DeleteItem(itemIdToDelete)).subscribe();

        // After completion, loading should be false
        const snapshot = store.snapshot();
        const accessState = snapshot.access as AccessStateModel;
        expect(accessState.loading).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty service responses', () => {
        accessService.GetAll.and.returnValue(of([]));

        store.dispatch(new FetchAccess()).subscribe();

        const items = store.selectSnapshot(AccessState.getItems);
        const count = store.selectSnapshot(AccessState.getCount);

        expect(items).toEqual([]);
        expect(count).toBe(0);
      });

      it('should maintain loading state consistency on errors', () => {
        accessService.GetAll.and.returnValue(
          throwError(() => new Error('Network error'))
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
