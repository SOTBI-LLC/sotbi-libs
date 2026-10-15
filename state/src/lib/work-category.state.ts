import { assignDraftIds, mergeSavedRows } from './state-row-updates';
import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { WorkCategoryService } from '@sotbi/data-access';
import type { WorkCategory } from '@sotbi/models';
import { canSave, isAllSaved } from '@sotbi/utils';
import { of, throwError } from 'rxjs';
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
    if (this.limit !== payload || !state.items.length) {
      this.limit = payload;
      patchState({ loading: true });
      return this.itemsService.getAll(payload).pipe(
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
    return of();
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
    { getState, patchState }: StateContext<WorkCategoryStateModel>,
    { payload }: AddWorkCategory,
  ) {
    const { workcategory, idx } = payload;
    const initial = getState();
    const drafts = assignDraftIds(initial.items);
    const submitted = drafts[idx];
    patchState({ items: drafts, loading: true });
    return this.itemsService
      .create({
        ...workcategory,
        id: workcategory.id && workcategory.id > 0 ? workcategory.id : 0,
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
    items[idx] = {
      ...workcategory,
      id: items[idx]?.id ?? workcategory.id,
      dirty: true,
    };
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
      const items = state.items.map((item, row) =>
        row === payload
          ? { ...(state.allItems[index] ?? this.rowData), dirty: false }
          : item,
      );
      return patchState({ items, saved: isAllSaved(items) });
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
    const items = getState().items.map((item, index) =>
      index === payload ? { ...this.rowData } : item,
    );
    return patchState({ items, saved: isAllSaved(items) });
  }

  @Action(UpdateWorkCategory)
  public updateItem(
    { getState, patchState }: StateContext<WorkCategoryStateModel>,
    { payload }: UpdateWorkCategory,
  ) {
    // console.log('WorkCategoryState::UpdateWorkCategory', payload);
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const state = getState();
        const items = state.items.map((el) =>
          el.id === selected.id ? selected : el,
        );
        patchState({ items, selected });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(SaveAllWorkCategory)
  public saveAllItems({
    getState,
    patchState,
  }: StateContext<WorkCategoryStateModel>) {
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
        WorkCategoryRequiredFields.every(
          (field) => !!item[field as keyof WorkCategory],
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

          patchState({ items, allItems, saved: isAllSaved(items), selected });
        }),
        finalize(() => patchState({ loading: false })),
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
