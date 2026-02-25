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
    { getState, patchState, setState }: StateContext<PositionStateModel>,
    { payload }: AddPosition,
  ) {
    console.log('PositionState::AddPosition', payload);
    patchState({ loading: true });
    const { position, idx } = payload;
    return this.itemsService.create(position).pipe(
      tap((result) => {
        result.dirty = false;
        const state = getState();
        state.items[idx] = result;
        setState({
          ...state,
          items: [...state.items /* Object.assign({}, this.rowData) */],
          allItems: [...state.allItems, result],
          count: state.count++,
          saved: isAllSaved(state.items),
        });
      }),
      catchError((err) => throwError(err)),
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
    // console.log('PositionState::EditPosition', payload);
    const { position, idx } = payload;
    const state = getState();
    position.dirty = true;
    state.items[idx] = position;
    return patchState({ items: state.items, saved: false });
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
    state.items[payload] = Object.assign({}, state.allItems[index]);
    state.items[payload].dirty = false;
    return patchState({ items: state.items, saved: isAllSaved(state.items) });
  }

  @Action(UpdatePosition)
  public updateItem(
    { getState, patchState }: StateContext<PositionStateModel>,
    { payload }: UpdatePosition,
  ) {
    // console.log('PositionState::UpdatePosition', payload);
    const { idx, position } = payload;
    const state = getState();
    return this.itemsService.update(position).pipe(
      tap((result: Position) => {
        result.dirty = false;
        state.items[idx] = result;
        const index = state.allItems.findIndex(({ id }) => id === result.id);
        state.allItems[index] = result;
        patchState({
          items: state.items,
          allItems: state.allItems,
          saved: isAllSaved(state.items),
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
    console.log('PositionState::SaveAllPositions');
    patchState({ loading: true });
    const state = getState();
    let idx = 0;
    const workcategory: Position[] = [];
    const idxs: Map<number, number> = new Map(); // храним соотвествие index в ag-grid и id в бд
    const fields = new Set(PositionsRequiredFields);
    for (const item of state.items) {
      if (item.dirty) {
        // для всех не сохраненных
        let filledFields = 0;
        for (const key in item) {
          if (
            Object.prototype.hasOwnProperty.call(item, key) &&
            fields.has(key) &&
            !!item[key as keyof Position]
          ) {
            filledFields++; // считаем количество заполненных полей
          }
        }
        // если все обязательные поля заполнены
        if (filledFields === fields.size) {
          workcategory.push(item); // заполняем массив для отправки на сервре для сохранения
          idxs.set(idx, item.id); // запоминаем какому индексу в ag-grid соответствует id в таблице
          item.dirty = false;
        }
      }
      idx++;
    }
    return this.itemsService.batchUpdate(workcategory).pipe(
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
        return patchState({
          items: state.items,
          allItems: state.allItems,
          loading: false,
          saved: true,
        });
      }),
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
