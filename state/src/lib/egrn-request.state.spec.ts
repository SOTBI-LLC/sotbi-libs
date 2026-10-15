import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { EgrnRequestService, RealEstateService } from '@sotbi/data-access';
import { EgrnRequest } from '@sotbi/models';
import { firstValueFrom, of } from 'rxjs';
import {
  FetchEgrnRequests,
  RemoveRealEstate,
  UpdateEgrnRequest,
} from './egrn-request.actions';
import { EgrnRequestState } from './egrn-request.state';

describe('EgrnRequestState saving', () => {
  it.each([false, true])(
    'saves without mutating the list (request in list: %s)',
    async (inList) => {
      const original = new EgrnRequest({ id: 4790, doer_comment: 'Исходный' });
      const updated = new EgrnRequest({
        id: 4790,
        doer_comment: 'Обновлённый',
      });
      const other = new EgrnRequest({ id: 4791, doer_comment: 'Другой' });
      TestBed.configureTestingModule({
        providers: [
          provideStore([EgrnRequestState], { developmentMode: true }),
          {
            provide: EgrnRequestService,
            useValue: {
              getall: jest.fn(() => of({ requests: [], count: 0 })),
              update: jest.fn(() => of(updated)),
            },
          },
          { provide: RealEstateService, useValue: {} },
        ],
      });
      const store = TestBed.inject(Store);
      const items = inList ? [other, original] : [other];
      store.reset({
        egrn_request: {
          items,
          selected: original,
          loading: false,
          count: items.length,
        },
      });
      const previous = store.selectSnapshot(EgrnRequestState.getItems);

      await firstValueFrom(
        store.dispatch(
          new UpdateEgrnRequest({ id: 4790, doer_comment: 'Обновлённый' }),
        ),
      );

      expect(store.selectSnapshot(EgrnRequestState.getSelected)).toEqual(
        updated,
      );
      expect(store.selectSnapshot(EgrnRequestState.getItems)).toEqual(
        inList ? [other, updated] : [other],
      );
      expect(previous).toEqual(inList ? [other, original] : [other]);
      expect(store.selectSnapshot(EgrnRequestState.getLoading)).toBe(false);
    },
  );
});

describe('EgrnRequestState loading and deleting real estate', () => {
  it('loads the request list through its action and finishes loading', async () => {
    const request = new EgrnRequest({ id: 4790 });
    TestBed.configureTestingModule({
      providers: [
        provideStore([EgrnRequestState], { developmentMode: true }),
        {
          provide: EgrnRequestService,
          useValue: { getall: () => of({ requests: [request], count: 1 }) },
        },
        { provide: RealEstateService, useValue: {} },
      ],
    });
    const store = TestBed.inject(Store);
    await firstValueFrom(
      store.dispatch(new FetchEgrnRequests({ refresh: true, view: false })),
    );
    expect(store.selectSnapshot(EgrnRequestState.getItems)).toEqual([request]);
    expect(store.selectSnapshot(EgrnRequestState.getLoading)).toBe(false);
  });

  it.each([true, false])(
    'removes only the deleted object without changing previous state (in list: %s)',
    async (inList) => {
      const original = new EgrnRequest({
        id: 4790,
        real_estates: [{ id: 11 } as never, { id: 12 } as never],
      });
      TestBed.configureTestingModule({
        providers: [
          provideStore([EgrnRequestState], { developmentMode: true }),
          {
            provide: EgrnRequestService,
            useValue: { getall: () => of({ requests: [], count: 0 }) },
          },
          {
            provide: RealEstateService,
            useValue: { delete: () => of(undefined) },
          },
        ],
      });
      const store = TestBed.inject(Store);
      store.reset({
        egrn_request: {
          items: inList ? [original] : [],
          selected: original,
          count: inList ? 1 : 0,
          loading: false,
        },
      });
      const previous = store.selectSnapshot(EgrnRequestState.getSelected);
      await firstValueFrom(
        store.dispatch(new RemoveRealEstate({ idx: 0, id: 11 })),
      );
      const selected = store.selectSnapshot(EgrnRequestState.getSelected);
      expect(selected?.real_estates.map((item) => item.id)).toEqual([12]);
      expect(previous?.real_estates.map((item) => item.id)).toEqual([11, 12]);
      expect(store.selectSnapshot(EgrnRequestState.getItems)).toEqual(
        inList ? [selected] : [],
      );
    },
  );
});
