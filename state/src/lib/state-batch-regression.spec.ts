import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import {
  PositionService,
  WorkCategoryService,
  BidStateService,
  BankruptcyService,
  DefraymentService,
  CounterpartyService,
} from '@sotbi/data-access';
import { EMPTY, firstValueFrom, of, Subject } from 'rxjs';
import { PositionState } from './positions.state';
import {
  SaveAllPositions,
  AddPosition,
  EditPosition,
} from './positions.actions';
import { WorkCategoryState } from './work-category.state';
import {
  SaveAllWorkCategory,
  AddWorkCategory,
  EditWorkCategory,
} from './work-category.actions';
import { BidStateState } from './bidstate.state';
import { SaveAllBidState, AddBidState, EditBidState } from './bidstate.actions';
import { BankruptcyState } from './bankruptcy.state';
import { CreateBankruptcy } from './bankruptcy.actions';
import { DefraymentState } from './defrayment.state';
import { AddDefrayment } from './defrayment.actions';
import { CounterpartyState } from './counterparty.state';
import { AddCounterparty } from './counterparty.actions';

class Row {
  public id = 1;
  public name = 'Изменённый';
  public dirty = true;
  public order = 1;
  public staff_id = 1;
  public type = 1;
  public user_group_id = 1;
}
describe.each([
  {
    state: PositionState,
    service: PositionService,
    action: () => new SaveAllPositions(),
    edit: (row: Row) => new EditPosition({ idx: 0, position: row as never }),
  },
  {
    state: WorkCategoryState,
    service: WorkCategoryService,
    action: () => new SaveAllWorkCategory(),
    edit: (row: Row) =>
      new EditWorkCategory({ idx: 0, workcategory: row as never }),
  },
  {
    state: BidStateState,
    service: BidStateService,
    action: () => new SaveAllBidState(),
    edit: (row: Row) => new EditBidState({ idx: 0, item: row as never }),
  },
])('batch saving in $state.name', ({ state, service, action, edit }) => {
  it.each([true, false])(
    'keeps untouched rows and preserves dirty values until server confirmation (success: %s)',
    async (success) => {
      const response = new Subject<Row[]>();
      TestBed.configureTestingModule({
        providers: [
          provideStore([state], { developmentMode: true }),
          {
            provide: service,
            useValue: {
              getall: () => EMPTY,
              getAll: () => EMPTY,
              GetAll: () => EMPTY,
              batchUpdate: () => response,
            },
          },
        ],
      });
      const store = TestBed.inject(Store);
      const initial = store.snapshot();
      const key = Object.keys(initial)[0];
      const row = new Row();
      const untouched = {
        ...row,
        id: 2,
        name: 'Не трогать',
        dirty: false,
        order: 2,
      };
      store.reset({
        ...initial,
        [key]: {
          ...initial[key],
          items: [row, untouched],
          allItems: [{ ...row, name: 'Исходный', dirty: false }, untouched],
          saved: false,
        },
      });
      const previous = store.selectSnapshot<Row[]>((s) => s[key].items);
      const pending = firstValueFrom(store.dispatch(action()));
      expect(store.selectSnapshot<Row[]>((s) => s[key].items)[0].dirty).toBe(
        true,
      );
      if (success) {
        response.next([{ ...row, name: 'Сохранённый' }]);
        response.complete();
        await pending;
        expect(
          store
            .selectSnapshot<Row[]>((s) => s[key].items)
            .map((item) => item.name),
        ).toEqual(['Сохранённый', 'Не трогать']);
        expect(store.selectSnapshot<Row[]>((s) => s[key].items)[0].dirty).toBe(
          false,
        );
      } else {
        const rejected = expect(pending).rejects.toThrow('Ошибка сервера');
        response.error(new Error('Ошибка сервера'));
        await rejected;
        expect(store.selectSnapshot<Row[]>((s) => s[key].items)[0].dirty).toBe(
          true,
        );
      }
      expect(previous[0].dirty).toBe(true);
      expect(store.selectSnapshot<boolean>((s) => s[key].loading)).toBe(false);
    },
  );

  it('retains the server id and newer edits when a new row changes during saving', async () => {
    const response = new Subject<Row[]>();
    TestBed.configureTestingModule({
      providers: [
        provideStore([state], { developmentMode: true }),
        {
          provide: service,
          useValue: {
            getall: () => EMPTY,
            getAll: () => EMPTY,
            GetAll: () => EMPTY,
            batchUpdate: () => response,
          },
        },
      ],
    });
    const store = TestBed.inject(Store);
    const initial = store.snapshot();
    const key = Object.keys(initial)[0];
    const draft = { ...new Row(), id: 0 };
    store.reset({
      ...initial,
      [key]: { ...initial[key], items: [draft], allItems: [], saved: false },
    });
    const pending = firstValueFrom(store.dispatch(action()));
    await firstValueFrom(
      store.dispatch(edit({ ...draft, name: 'Новая правка' })),
    );
    response.next([{ ...draft, id: 10 }]);
    response.complete();
    await pending;
    const saved = store.selectSnapshot<Row[]>((s) => s[key].items)[0];
    expect(saved.id).toBe(10);
    expect(saved.name).toBe('Новая правка');
    expect(saved.dirty).toBe(true);
  });
});

describe.each([
  {
    state: BankruptcyState,
    service: BankruptcyService,
    action: (row: Row) => new CreateBankruptcy(row as never),
  },
  {
    state: DefraymentState,
    service: DefraymentService,
    action: (row: Row) => new AddDefrayment(row as never),
  },
  {
    state: CounterpartyState,
    service: CounterpartyService,
    action: (row: Row) => new AddCounterparty(row as never),
  },
])('creating in $state.name', ({ state, service, action }) => {
  it('increments the count without modifying the frozen previous state', async () => {
    const row = new Row();
    TestBed.configureTestingModule({
      providers: [
        provideStore([state], { developmentMode: true }),
        {
          provide: service,
          useValue: {
            getall: () => EMPTY,
            getAll: () => EMPTY,
            GetAll: () => EMPTY,
            add: () => of(row),
            create: () => of(row),
          },
        },
      ],
    });
    const store = TestBed.inject(Store);
    const initial = store.snapshot();
    const key = Object.keys(initial)[0];
    store.reset({
      ...initial,
      [key]: { ...initial[key], items: [], count: 0 },
    });
    await firstValueFrom(store.dispatch(action(row)));
    expect(store.selectSnapshot<number>((s) => s[key].count)).toBe(1);
    expect(store.selectSnapshot<Row[]>((s) => s[key].items)).toEqual([row]);
  });
});

describe.each([
  {
    state: PositionState,
    service: PositionService,
    create: (row: Row) => new AddPosition({ idx: 1, position: row as never }),
  },
  {
    state: WorkCategoryState,
    service: WorkCategoryService,
    create: (row: Row) =>
      new AddWorkCategory({ idx: 1, workcategory: row as never }),
  },
  {
    state: BidStateState,
    service: BidStateService,
    create: (row: Row) => new AddBidState({ idx: 1, item: row as never }),
  },
])('creating a draft in $state.name', ({ state, service, create }) => {
  it('updates the submitted row after reordering without replacing another selected card', async () => {
    const response = new Subject<Row>();
    TestBed.configureTestingModule({
      providers: [
        provideStore([state], { developmentMode: true }),
        {
          provide: service,
          useValue: {
            getall: () => EMPTY,
            getAll: () => EMPTY,
            GetAll: () => EMPTY,
            create: () => response,
            add: () => response,
          },
        },
      ],
    });
    const store = TestBed.inject(Store);
    const initial = store.snapshot();
    const key = Object.keys(initial)[0];
    const first = { ...new Row(), id: 1, name: 'Удалённая строка' };
    const draft = { ...new Row(), id: 0 };
    const other = { ...new Row(), id: 2, name: 'Другая строка' };
    store.reset({
      ...initial,
      [key]: {
        ...initial[key],
        items: [first, draft, other],
        allItems: [first, other],
        selected: draft,
      },
    });
    const pending = firstValueFrom(store.dispatch(create(draft)));
    const current = store.snapshot();
    store.reset({
      ...current,
      [key]: {
        ...current[key],
        items: current[key].items.slice(1),
        selected: other,
      },
    });
    response.next({ ...draft, id: 10 });
    response.complete();
    await pending;
    expect(
      store.selectSnapshot<Row[]>((s) => s[key].items).map((row) => row.id),
    ).toEqual([10, 2]);
    expect(store.selectSnapshot<Row>((s) => s[key].selected)).toEqual(other);
  });
});
