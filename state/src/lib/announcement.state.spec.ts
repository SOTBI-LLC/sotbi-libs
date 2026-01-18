import { TestBed } from '@angular/core/testing';
import { Store, provideStates } from '@ngxs/store';
import { AnnouncementService } from '@services/announcement.service';
import { Announcement, DatePublish } from '@sotbi/models';
import { configureTestBed } from '@test-setup';
import { of, throwError } from 'rxjs';
import { AddItem, DeleteItem, FetchItems, GetItem, UpdateItem } from './announcement.actions';
import { AnnouncementState, AnnouncementStateModel } from './announcement.state';

describe('AnnouncementState', () => {
  let store: Store;
  let svc: jasmine.SpyObj<AnnouncementService>;

  const mockItem: Announcement = {
    id: 1,
    title: 'Title 1',
    content: 'Content 1',
    creator_id: 10,
    start: new Date('2024-01-01T00:00:00Z'),
    end: new Date('2024-12-31T23:59:59Z'),
    author_id: 20,
  };

  const mockItem2: Announcement = {
    id: 2,
    title: 'Title 2',
    content: 'Content 2',
    creator_id: 11,
    start: new Date('2024-02-01T00:00:00Z'),
    end: new Date('2024-11-30T23:59:59Z'),
    author_id: 21,
  };

  beforeEach(async () => {
    const svcSpy = jasmine.createSpyObj('AnnouncementService', [
      'getAllWithCondition',
      'get',
      'add',
      'update',
      'delete',
    ]);

    await configureTestBed({
      providers: [
        { provide: AnnouncementService, useValue: svcSpy },
        provideStates([AnnouncementState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    svc = TestBed.inject(AnnouncementService) as jasmine.SpyObj<AnnouncementService>;
  });

  describe('Selectors', () => {
    it('getItems should return items', () => {
      const state: AnnouncementStateModel = {
        items: [mockItem, mockItem2],
        selected: null,
        loading: false,
        count: 2,
      };

      expect(AnnouncementState.getItems(state)).toEqual([mockItem, mockItem2]);
    });

    it('getSelected should return selected', () => {
      const state: AnnouncementStateModel = {
        items: [],
        selected: mockItem,
        loading: false,
        count: 0,
      };

      expect(AnnouncementState.getSelected(state)).toEqual(mockItem);
    });

    it('getLoading should return loading flag', () => {
      const state: AnnouncementStateModel = {
        items: [],
        selected: null,
        loading: true,
        count: 0,
      };

      expect(AnnouncementState.getLoading(state)).toBeTrue();
    });
  });

  describe('FetchItems', () => {
    it('should fetch when items are empty (success path)', (done) => {
      svc.getAllWithCondition.and.returnValue(of([mockItem, mockItem2]));

      store
        .dispatch(new FetchItems({ all: false, refresh: true, show_planned: true, omit_img: true }))
        .subscribe(() => {
          const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
          expect(svc.getAllWithCondition).toHaveBeenCalledWith(false, true, true);
          expect(state.items).toEqual([mockItem, mockItem2]);
          expect(state.count).toBe(2);
          expect(state.loading).toBeFalse();
          done();
        });
    });

    it('should not fetch when items exist and refresh=false', (done) => {
      store.reset({
        announcement: {
          items: [mockItem],
          selected: null,
          loading: false,
          count: 1,
        } as AnnouncementStateModel,
      });

      store.dispatch(new FetchItems({ all: false, refresh: false })).subscribe(() => {
        expect(svc.getAllWithCondition).not.toHaveBeenCalled();
        done();
      });
    });

    it('should set loading=false on errors', (done) => {
      svc.getAllWithCondition.and.returnValue(throwError(() => new Error('Fetch failed')));

      store.dispatch(new FetchItems({ all: false, refresh: true })).subscribe({
        next: () => fail('Expected error'),
        error: () => {
          const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
          expect(state.loading).toBeFalse();
          done();
        },
      });
    });
  });

  describe('GetItem', () => {
    it('should set default selected when payload is falsy (0)', () => {
      store.dispatch(new GetItem(0));
      const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
      expect(state.selected).toEqual({
        id: 0,
        title: null,
        content: null,
        creator_id: null,
        date_publish: DatePublish.NOW,
        start: null,
        end: null,
        author_id: null,
      } as any);
      expect(state.loading).toBeFalse();
    });

    it('should fetch and set selected when id provided', (done) => {
      svc.get.and.returnValue(of(mockItem));

      store.dispatch(new GetItem(1)).subscribe(() => {
        expect(svc.get).toHaveBeenCalledWith(1);
        const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
        expect(state.selected).toEqual(mockItem);
        expect(state.loading).toBeFalse();
        done();
      });
    });

    it('should set loading=false on errors', (done) => {
      svc.get.and.returnValue(throwError(() => new Error('Get failed')));

      store.dispatch(new GetItem(123)).subscribe({
        next: () => fail('Expected error'),
        error: () => {
          const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
          expect(state.loading).toBeFalse();
          done();
        },
      });
    });
  });

  describe('AddItem', () => {
    it('should add item, set selected and increase count', (done) => {
      const created = { ...mockItem, id: 999 };
      svc.add.and.returnValue(of(created));

      store.reset({
        announcement: { items: [mockItem2], selected: null, loading: false, count: 1 },
      });

      store.dispatch(new AddItem(created)).subscribe(() => {
        const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
        expect(state.items[0]).toEqual(created);
        expect(state.selected).toEqual(created);
        expect(state.count).toBe(2);
        expect(state.loading).toBeFalse();
        done();
      });
    });

    it('should set loading=false on errors', (done) => {
      svc.add.and.returnValue(throwError(() => new Error('Create failed')));

      store.dispatch(new AddItem(mockItem)).subscribe({
        next: () => fail('Expected error'),
        error: () => {
          const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
          expect(state.loading).toBeFalse();
          done();
        },
      });
    });
  });

  describe('UpdateItem', () => {
    it('should update item in list and set selected', (done) => {
      const updated = { ...mockItem, title: 'Updated' };
      svc.update.and.returnValue(of(updated));

      store.reset({
        announcement: {
          items: [mockItem, mockItem2],
          selected: null,
          loading: false,
          count: 2,
        },
      });

      store.dispatch(new UpdateItem(updated)).subscribe(() => {
        const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
        expect(state.items.find((i) => i.id === 1)?.title).toBe('Updated');
        expect(state.selected).toEqual(updated);
        expect(state.loading).toBeFalse();
        done();
      });
    });

    it('should set loading=false on errors', (done) => {
      svc.update.and.returnValue(throwError(() => new Error('Update failed')));

      store.dispatch(new UpdateItem(mockItem)).subscribe({
        next: () => fail('Expected error'),
        error: () => {
          const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
          expect(state.loading).toBeFalse();
          done();
        },
      });
    });
  });

  describe('DeleteItem', () => {
    it('should delete item from list', (done) => {
      svc.delete.and.returnValue(of(void 0));

      store.reset({
        announcement: {
          items: [mockItem, mockItem2],
          selected: mockItem,
          loading: false,
          count: 2,
        },
      });

      store.dispatch(new DeleteItem(1)).subscribe(() => {
        const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
        expect(state.items.find((i) => i.id === 1)).toBeUndefined();
        expect(state.items.length).toBe(1);
        expect(state.loading).toBeFalse();
        done();
      });
    });

    it('should set loading=false on errors', (done) => {
      svc.delete.and.returnValue(throwError(() => new Error('Delete failed')));

      store.dispatch(new DeleteItem(1)).subscribe({
        next: () => fail('Expected error'),
        error: () => {
          const state = store.selectSnapshot((s: any) => s.announcement) as AnnouncementStateModel;
          expect(state.loading).toBeFalse();
          done();
        },
      });
    });
  });
});
