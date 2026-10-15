import { assignDraftIds, mergeSavedRows } from './state-row-updates';
import { inject, Injectable } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { BidStateService } from '@sotbi/data-access';
import type { BidState, itemMap } from '@sotbi/models';
import { canSave, isAllSaved } from '@sotbi/utils';
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

export const BidStateRequiredFields = ['name', 'order'];

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
    return !state.saved && canSave(state.items, BidStateRequiredFields);
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
              allItems: structuredClone(items),
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
    { getState, patchState }: StateContext<BidStateStateModel>,
    { payload }: AddBidState,
  ) {
    const { item, idx } = payload;
    const initial = getState();
    const drafts = assignDraftIds(initial.items);
    const submitted = drafts[idx];
    patchState({ items: drafts, loading: true });
    return this.itemsService.create({ ...item, id: 0 }).pipe(
      tap((result) => {
        const current = getState();
        const merged = mergeSavedRows({
          items: current.items,
          allItems: current.allItems,
          pending: submitted ? [submitted] : [],
          results: [result],
        });
        const selected =
          current.selected === initial.selected ||
          current.selected?.id === submitted?.id
            ? (merged.items.find((entry) => entry.id === result.id) ?? result)
            : current.selected;
        patchState({
          ...merged,
          count: current.count + 1,
          saved: isAllSaved(merged.items),
          selected,
        });
      }),
      catchError((err) => throwError(() => err)),
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
    const count = state.count + 1;
    item.order = count;
    return patchState({
      items: [...state.items, item],
      selected: item,
      count,
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
      id: state.items[idx]?.id ?? item.id ?? 0,
      dirty: true,
    };
    const items = state.items.map((entry, index) =>
      index === idx ? updatedItem : entry,
    );
    return patchState({ items, saved: false });
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
      const items = state.items.map((item, row) =>
        row === payload
          ? { ...(state.allItems[index] ?? this.rowData), dirty: false }
          : item,
      );
      // console.log(idx, index, state.items[payload], state.allItems[index]);
      return patchState({ items, saved: isAllSaved(items) });
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
    const items = getState().items.filter((_, index) => index !== payload);
    return patchState({ items, saved: isAllSaved(items), selected: null });
  }

  @Action(UpdateBidState)
  public updateItem(
    { getState, setState, patchState }: StateContext<BidStateStateModel>,
    { payload }: UpdateBidState,
  ) {
    // console.log('BidStateState::UpdateBidState', payload);
    patchState({ loading: true });
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const state = getState();
        selected = { ...selected, dirty: false };
        const items = state.items.map((item) =>
          item.id === selected.id ? selected : item,
        );
        const index = state.allItems.findIndex(({ id }) => id === selected.id);
        const allItems = [...state.allItems];
        if (index >= 0) {
          allItems[index] = selected;
        } else {
          allItems.push(selected);
        }
        setState({
          ...state,
          items,
          selected:
            !state.selected || state.selected.id === selected.id
              ? selected
              : state.selected,
          allItems,
          saved: isAllSaved(items),
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
    const initial = getState();
    const items = assignDraftIds(initial.items);
    const selectedIndex = initial.items.findIndex(
      (item) => item === initial.selected,
    );
    patchState({
      items,
      loading: true,
      ...(selectedIndex >= 0 ? { selected: items[selectedIndex] } : {}),
    });
    const pending = items.filter(
      (item) =>
        item.dirty &&
        BidStateRequiredFields.every(
          (field) => !!item[field as keyof BidState],
        ),
    );
    return this.itemsService
      .batchUpdate(
        pending.map((item) => ({ ...item, id: item.id < 0 ? 0 : item.id })),
      )
      .pipe(
        tap((results) => {
          const current = getState();
          const { items, allItems } = mergeSavedRows({
            items: current.items,
            allItems: current.allItems,
            pending,
            results,
          });
          const selectedIndex = current.items.findIndex(
            (item) => item.id === current.selected?.id,
          );
          const selected =
            selectedIndex >= 0 ? items[selectedIndex] : current.selected;
          items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          patchState({ items, allItems, saved: isAllSaved(items), selected });
        }),
        finalize(() => patchState({ loading: false })),
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
