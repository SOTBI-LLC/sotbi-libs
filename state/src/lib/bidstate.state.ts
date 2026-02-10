import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { BidStateService } from '@sotbi/data-access';
import type { BidState } from '@sotbi/models';
import { canSave, isAllSaved } from '@sotbi/utils';
import { clone } from 'ramda';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddBidState,
  AddEmptyBidState,
  CancelBidState,
  DeleteBidState,
  EditBidState,
  EmptyBidState,
  FetchBidState,
  GetBidState,
  SaveAllBidState,
  UpdateBidState,
} from './bidstate.actions';
import type { itemMap } from './simple-edit.state.model';

export const RequiredFields = ['name', 'order'];

export interface BidStateStateModel {
  allItems: BidState[];
  items: BidState[];
  mapItems: itemMap;
  selected: BidState | null;
  loading: boolean;
  count: number;
  saved: boolean;
}

@State<BidStateStateModel>({
  name: 'bidstate',
  defaults: {
    allItems: [],
    items: [],
    mapItems: new Map(),
    loading: false,
    selected: null,
    count: 0,
    saved: true,
  },
})
@Injectable()
export class BidStateState implements NgxsOnInit {
  private readonly itemsService = inject(BidStateService);

  private readonly rowData: BidState = {
    id: 0,
    name: null,
    order: null,
    description: null,
    dirty: false,
  };

  @Selector()
  public static getLoading(state: BidStateStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static saved(state: BidStateStateModel): boolean {
    return state.saved;
  }

  @Selector()
  public static getAllItems(state: BidStateStateModel): BidState[] {
    return state.allItems;
  }

  @Selector()
  public static getSelected(state: BidStateStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: BidStateStateModel): BidState[] {
    return state.items;
  }

  @Selector()
  public static getMapItems(state: BidStateStateModel): itemMap {
    return state.mapItems;
  }

  @Selector()
  public static canSave(state: BidStateStateModel): boolean {
    return !state.saved && canSave(state.items, RequiredFields);
  }

  public ngxsOnInit({ dispatch }: StateContext<BidStateStateModel>) {
    dispatch(new FetchBidState());
  }

  @Action(FetchBidState)
  public fetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<BidStateStateModel>) {
    // console.log('BidStateState::FetchBidState');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.itemsService.getAll().pipe(
        catchError((err) => {
          return throwError(err);
        }),
        tap(
          (items) => {
            setState({
              ...state,
              allItems: clone(items),
              selected: null,
              mapItems: new Map(
                items.map((i): [number, string] => [i.id, i.name ?? '']),
              ),
              items: items.map((el) => {
                el.dirty = false;
                return el;
              }),
              count: items.length,
              saved: true,
            });
          },
          (error) => {
            console.error(error.message);
          },
        ),
        finalize(() => patchState({ loading: false })),
      );
    }
    return patchState({ loading: false });
  }

  @Action(GetBidState)
  public getItem(
    { patchState, getState }: StateContext<BidStateStateModel>,
    { payload }: GetBidState,
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = state.items.find(({ id }) => id === payload);
    patchState({ selected, loading: false });
  }

  @Action(AddBidState)
  public createItem(
    { getState, patchState, setState }: StateContext<BidStateStateModel>,
    { payload }: AddBidState,
  ) {
    patchState({ loading: true });
    const { item, idx } = payload;
    return this.itemsService.create(item).pipe(
      tap((result) => {
        result.dirty = false;
        const state = getState();
        state.items[idx] = result;
        setState({
          ...state,
          items: [...state.items],
          allItems: [...state.allItems, result],
          selected: result,
          count: state.count++,
          saved: isAllSaved(state.items),
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(AddEmptyBidState)
  public addEmptyItem({
    getState,
    patchState,
  }: StateContext<BidStateStateModel>) {
    // console.log('BidStateState::AddEmptyBidState');
    const state = getState();
    const item = Object.assign({}, this.rowData);
    state.count++;
    item.order = state.count;
    return patchState({
      items: [...state.items, item],
      selected: item,
      count: state.count,
    });
  }

  @Action(EditBidState)
  public editItem(
    { getState, patchState }: StateContext<BidStateStateModel>,
    { payload }: EditBidState,
  ) {
    // console.log('BidStateState::EditBidState', payload);
    const { item, idx } = payload;
    const state = getState();
    const updatedItem: BidState = {
      ...state.items[idx],
      ...item,
      dirty: true,
    };
    state.items[idx] = updatedItem;
    return patchState({ items: state.items, saved: false });
  }

  @Action(CancelBidState)
  public cancelItem(
    { getState, patchState, dispatch }: StateContext<BidStateStateModel>,
    { payload }: CancelBidState,
  ) {
    console.log('BidStateState::CancelBidState', payload);
    const state = getState();
    const idx = state.items[payload].id;
    if (idx > 0) {
      const index = state.allItems.findIndex(({ id }) => id === idx);
      state.items[payload] = Object.assign({}, state.allItems[index]);
      state.items[payload].dirty = false;
      // console.log(idx, index, state.items[payload], state.allItems[index]);
      return patchState({ items: state.items, saved: isAllSaved(state.items) });
    } else {
      return dispatch(new EmptyBidState(payload));
    }
  }

  @Action(EmptyBidState)
  public emptyItem(
    { getState, patchState }: StateContext<BidStateStateModel>,
    { payload }: EmptyBidState,
  ) {
    // console.log('BidStateState::EmptyBidState', payload);
    const items = getState().items;
    items.splice(payload, 1);
    return patchState({ items, saved: isAllSaved(items), selected: null });
  }

  @Action(UpdateBidState)
  public updateItem(
    { getState, setState, patchState }: StateContext<BidStateStateModel>,
    { payload }: UpdateBidState,
  ) {
    // console.log('BidStateState::UpdateBidState', payload);
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        selected.dirty = false;
        const idx = state.items.findIndex(({ id }) => id === selected.id);
        const items = [...state.items];
        items[idx] = selected;
        const index = state.allItems.findIndex(({ id }) => id === selected.id);
        const allItems = [...state.allItems];
        allItems[index] = selected;
        setState({
          ...state,
          items,
          selected,
          allItems,
          saved: isAllSaved(state.items),
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(SaveAllBidState)
  public saveAllItems({
    getState,
    patchState,
  }: StateContext<BidStateStateModel>) {
    // console.log('BidStateState::SaveAllBidState');
    patchState({ loading: true });
    const state = getState();
    let idx = 0;
    const states: BidState[] = [];
    const idxs: Map<number, number> = new Map(); // храним соотвествие index в ag-grid и id в бд
    const fields = new Set(RequiredFields);
    for (const item of state.items) {
      if (item.dirty) {
        // для всех не сохраненных
        let filledFields = 0;
        for (const key in item) {
          const value = item[key as keyof BidState];
          if (
            Object.prototype.hasOwnProperty.call(item, key) &&
            fields.has(key) &&
            !!value
          ) {
            filledFields++; // считаем количество заполненных полей
          }
        }
        // если все обязательные поля заполнены
        if (filledFields === fields.size) {
          states.push(item); // заполняем массив для отправки на сервре для сохранения
          idxs.set(idx, item.id); // запоминаем какому индексу в ag-grid соответствует id в таблице
          item.dirty = false;
        }
      }
      idx++;
    }
    return this.itemsService.batchUpdate(states).pipe(
      tap((items) => {
        let i = 0;
        for (const [key, value] of idxs) {
          state.items[key] = items[i];
          if (value > 0) {
            // если ранее был сохранен, то обновляем
            const index = state.allItems.findIndex(({ id }) => id === value);
            state.allItems[index] = items[i];
          } else {
            // иначе добавляем
            state.allItems.push(items[i]);
          }
          i++;
        }
        state.items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return patchState({
          items: state.items,
          allItems: state.allItems,
          loading: false,
          saved: true,
        });
      }),
    );
  }

  @Action(DeleteBidState)
  public deleteItem(
    { getState, patchState, setState }: StateContext<BidStateStateModel>,
    { payload }: DeleteBidState,
  ) {
    // console.log('BidStateState::DeleteBidState', payload);
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        setState({
          ...state,
          items,
          allItems: state.allItems.filter((el) => el.id !== payload),
          saved: isAllSaved(items),
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }
}
