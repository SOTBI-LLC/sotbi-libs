import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { WorkCategoryService } from '@sotbi/data-access';
import type { WorkCategory } from '@sotbi/models';
import { canSave, isAllSaved } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddEmptyWorkCategory,
  AddWorkCategory,
  CancelWorkCategory,
  DeleteWorkCategory,
  EditWorkCategory,
  EmptyWorkCategory,
  FetchWorkCategory,
  GetWorkCategory,
  SaveAllWorkCategory,
  UpdateWorkCategory,
} from './work-category.actions';

export const WorkCategoryRequiredFields = ['name', 'staff_id', 'type'];

export interface WorkCategoryStateModel {
  allItems: WorkCategory[];
  items: WorkCategory[];
  selected: WorkCategory | null;
  loading?: boolean;
  count: number;
  saved: boolean;
}

@State<WorkCategoryStateModel>({
  name: 'workcategory',
  defaults: {
    allItems: [],
    items: [],
    loading: false,
    selected: null,
    count: 0,
    saved: true,
  },
})
@Injectable()
export class WorkCategoryState {
  private readonly itemsService = inject(WorkCategoryService);

  private limit = -1;
  private readonly rowData: WorkCategory = {
    id: 0,
    name: null,
    staff_id: null,
    type: null,
    dirty: false,
  };

  @Selector()
  public static getLoading(state: WorkCategoryStateModel): boolean {
    return state.loading ?? false;
  }

  @Selector()
  public static saved(state: WorkCategoryStateModel): boolean {
    return state.saved;
  }

  @Selector()
  public static getAllItems(state: WorkCategoryStateModel): WorkCategory[] {
    return state.allItems;
  }

  @Selector()
  public static getSelected(state: WorkCategoryStateModel) {
    return state.selected;
  }
  @Selector()
  public static getItems(state: WorkCategoryStateModel): WorkCategory[] {
    return state.items;
  }

  @Selector()
  public static canSave(state: WorkCategoryStateModel): boolean {
    return !state.saved && canSave(state.items, WorkCategoryRequiredFields);
  }

  @Action(FetchWorkCategory)
  public fetchItems(
    { getState, setState, patchState }: StateContext<WorkCategoryStateModel>,
    { payload }: FetchWorkCategory,
  ) {
    const state = getState();
    if (this.limit !== payload /*|| !state.items.length*/) {
      this.limit = payload;
      patchState({ loading: true });
      this.itemsService.getAll(payload).pipe(
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
        tap((items) => {
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
        }),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(GetWorkCategory)
  public getItem(
    { patchState, getState }: StateContext<WorkCategoryStateModel>,
    { payload }: GetWorkCategory,
  ) {
    patchState({ loading: true });
    const state = getState();
    const selected = state.items.find(({ id }) => id === payload);
    patchState({ selected, loading: false });
  }

  @Action(AddWorkCategory)
  public createItem(
    { getState, patchState, setState }: StateContext<WorkCategoryStateModel>,
    { payload }: AddWorkCategory,
  ) {
    patchState({ loading: true });
    const { workcategory, idx } = payload;
    return this.itemsService.create(workcategory).pipe(
      tap((result) => {
        result.dirty = false;
        const state = getState();
        state.items[idx] = result;
        setState({
          ...state,
          items: [...state.items, Object.assign({}, this.rowData)],
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

  @Action(AddEmptyWorkCategory)
  public addEmptyItem({
    getState,
    patchState,
  }: StateContext<WorkCategoryStateModel>) {
    // console.log('WorkCategoryState::AddEmptyWorkCategory');
    const state = getState();
    return patchState({
      items: [...state.items, Object.assign({}, this.rowData)],
    });
  }

  @Action(EditWorkCategory)
  public editItem(
    { getState, setState }: StateContext<WorkCategoryStateModel>,
    { payload }: EditWorkCategory,
  ) {
    // console.log('WorkCategoryState::EditWorkCategory', payload);
    const { workcategory, idx } = payload;
    const state = getState();
    const items = [...state.items];
    workcategory.dirty = true;
    items[idx] = workcategory;
    return setState({ ...state, items, saved: false });
  }

  @Action(CancelWorkCategory)
  public cancelItem(
    { getState, patchState, dispatch }: StateContext<WorkCategoryStateModel>,
    { payload }: CancelWorkCategory,
  ) {
    // console.log('WorkCategoryState::CancelWorkCategory', payload);
    const state = getState();
    const idx = state.items[payload].id;
    if (idx > 0) {
      const index = state.allItems.findIndex(({ id }) => id === idx);
      state.items[payload] = Object.assign({}, state.allItems[index]);
      state.items[payload].dirty = false;
      return patchState({ items: state.items, saved: isAllSaved(state.items) });
    } else {
      return dispatch(new EmptyWorkCategory(payload));
    }
  }

  @Action(EmptyWorkCategory)
  public emptyItem(
    { getState, patchState }: StateContext<WorkCategoryStateModel>,
    { payload }: EmptyWorkCategory,
  ) {
    // console.log('WorkCategoryState::EmptyWorkCategory', payload);
    const items = getState().items;
    items[payload] = Object.assign({}, this.rowData);
    return patchState({ items, saved: isAllSaved(items) });
  }

  @Action(UpdateWorkCategory)
  public updateItem(
    { getState, patchState }: StateContext<WorkCategoryStateModel>,
    { payload }: UpdateWorkCategory,
  ) {
    // console.log('WorkCategoryState::UpdateWorkCategory', payload);
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const items = state.items;
        const idx = items.findIndex(({ id }) => id === selected.id);
        items[idx] = selected;
        patchState({ items, selected });
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }

  @Action(SaveAllWorkCategory)
  public saveAllItems({
    getState,
    patchState,
  }: StateContext<WorkCategoryStateModel>) {
    // console.log('WorkCategoryState::SaveAllWorkCategory');
    patchState({ loading: true });
    const items: WorkCategory[] = getState().items;
    const allItems: WorkCategory[] = getState().allItems;
    let idx = 0;
    const workcategory: WorkCategory[] = [];
    const idxs: Map<number, number> = new Map(); // храним соотвествие index в ag-grid и id в бд
    const fields = new Set(WorkCategoryRequiredFields);
    for (const item of items) {
      if (item.dirty) {
        // для всех не сохраненных
        let filledFields = 0;
        for (const key in item) {
          if (
            Object.prototype.hasOwnProperty.call(item, key) &&
            fields.has(key) &&
            !!item[key as keyof WorkCategory]
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
          items[key] = items[i];
          if (value > 0) {
            // если ранее был сохранен, то обновляем
            const index = allItems.findIndex(({ id }) => id === value);
            allItems[index] = items[i];
          } else {
            // иначе добавляем
            allItems.push(items[i]);
          }
          i++;
        }
        return patchState({
          items,
          allItems,
          loading: false,
          saved: true,
        });
      }),
    );
  }

  @Action(DeleteWorkCategory)
  public deleteItem(
    { getState, patchState, setState }: StateContext<WorkCategoryStateModel>,
    { payload }: DeleteWorkCategory,
  ) {
    // console.log('WorkCategoryState::DeleteWorkCategory', payload);
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
