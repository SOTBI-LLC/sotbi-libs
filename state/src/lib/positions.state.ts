import { assignDraftIds, mergeSavedRows } from './state-row-updates';
import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { PositionService } from '@sotbi/data-access';
import { Position } from '@sotbi/models';
import { canSave, isAllSaved } from '@sotbi/utils';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddEmptyPosition,
  AddPosition,
  CancelPosition,
  DeletePosition,
  EditPosition,
  /*  EmptyPosition, */
  FetchPositions,
  SaveAllPositions,
  UpdatePosition,
} from './positions.actions';

export const PositionsRequiredFields = [
  'name',
  'user_group_id' /* 'settings', 'staff_type_id' */,
];

export interface PositionStateModel {
  allItems: Position[];
  items: Position[];
  loading: boolean;
  count: number;
  saved: boolean;
}

@State<PositionStateModel>({
  name: 'positions',
  defaults: {
    allItems: [],
    items: [],
    loading: false,
    count: 0,
    saved: true,
  },
})
@Injectable()
export class PositionState implements NgxsOnInit {
  private readonly itemsService = inject(PositionService);

  private readonly rowData = new Position();

  @Selector()
  public static getLoading(state: PositionStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static saved(state: PositionStateModel): boolean {
    return state.saved;
  }

  @Selector()
  public static getAllItems(state: PositionStateModel): Position[] {
    return state.allItems;
  }

  @Selector()
  public static getItems(state: PositionStateModel): Position[] {
    return state.items;
  }

  @Selector()
  public static canSave(state: PositionStateModel): boolean {
    return !state.saved && canSave(state.items, PositionsRequiredFields);
  }

  public ngxsOnInit({ dispatch }: StateContext<PositionStateModel>) {
    dispatch(new FetchPositions());
  }

  @Action(FetchPositions)
  public fetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<PositionStateModel>) {
    // console.log('PositionState::FetchPositions');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.itemsService.getAll(-1).pipe(
        catchError((err) => throwError(() => err)),
        tap({
          next: (items: Position[]) => {
            items = items.map((el) => {
              el.dirty = false;
              return el;
            });
            setState({
              ...state,
              allItems: structuredClone(items),
              items: [...items /* , Object.assign({}, this.rowData) */],
              count: items.length,
              saved: true,
            });
          },
          error: (error) => {
            console.error(error.message);
          },
        }),
        finalize(() => patchState({ loading: false })),
      );
    }
    return of();
  }

  @Action(AddPosition)
  public createItem(
    { getState, patchState }: StateContext<PositionStateModel>,
    { payload }: AddPosition,
  ) {
    const { position, idx } = payload;
    const initial = getState();
    const drafts = assignDraftIds(initial.items);
    const submitted = drafts[idx];
    patchState({ items: drafts, loading: true });
    return this.itemsService
      .create({
        ...position,
        id: position.id && position.id > 0 ? position.id : 0,
      })
      .pipe(
        tap((result) => {
          const current = getState();
          const merged = mergeSavedRows({
            items: current.items,
            allItems: current.allItems,
            pending: submitted ? [submitted] : [],
            results: [result],
          });

          patchState({
            ...merged,
            count: current.count + 1,
            saved: isAllSaved(merged.items),
          });
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
  }

  @Action(AddEmptyPosition)
  public addEmptyItem({
    getState,
    patchState,
  }: StateContext<PositionStateModel>) {
    console.log('PositionState::AddEmptyPosition');
    const state = getState();
    return patchState({
      items: [...state.items, Object.assign({}, this.rowData)],
    });
  }

  @Action(EditPosition)
  public editItem(
    { getState, patchState }: StateContext<PositionStateModel>,
    { payload }: EditPosition,
  ) {
    const { position, idx } = payload;
    const items = [...getState().items];
    items[idx] = {
      ...position,
      id: items[idx]?.id ?? position.id,
      dirty: true,
    };
    return patchState({ items, saved: false });
  }

  @Action(CancelPosition)
  public cancelItem(
    { getState, patchState }: StateContext<PositionStateModel>,
    { payload }: CancelPosition,
  ) {
    console.log('PositionState::CancelPosition', payload);
    const state = getState();
    const idx = state.items[payload].id;
    const index = state.allItems.findIndex(({ id }) => id === idx);
    const items = state.items.map((item, row) =>
      row === payload
        ? { ...(state.allItems[index] ?? this.rowData), dirty: false }
        : item,
    );
    return patchState({ items, saved: isAllSaved(items) });
  }

  @Action(UpdatePosition)
  public updateItem(
    { getState, patchState }: StateContext<PositionStateModel>,
    { payload }: UpdatePosition,
  ) {
    // console.log('PositionState::UpdatePosition', payload);
    const { position } = payload;
    const submitted = getState().items.find((item) => item.id === position.id);
    return this.itemsService.update(position).pipe(
      tap((result: Position) => {
        const state = getState();
        const { items, allItems } = mergeSavedRows({
          items: state.items,
          allItems: state.allItems,
          pending: submitted ? [submitted] : [],
          results: [result],
        });
        patchState({
          items,
          allItems,
          saved: isAllSaved(items),
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  @Action(SaveAllPositions)
  public saveAllItems({
    getState,
    patchState,
  }: StateContext<PositionStateModel>) {
    const initial = getState();
    const items = assignDraftIds(initial.items);

    patchState({ items, loading: true });
    const pending = items.filter(
      (item) =>
        item.dirty &&
        PositionsRequiredFields.every(
          (field) => !!item[field as keyof Position],
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

          patchState({ items, allItems, saved: isAllSaved(items) });
        }),
        finalize(() => patchState({ loading: false })),
      );
  }

  @Action(DeletePosition)
  public deleteItem(
    { getState, patchState, setState }: StateContext<PositionStateModel>,
    { payload }: DeletePosition,
  ) {
    // console.log('PositionState::DeletePosition', payload);
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
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }
}
