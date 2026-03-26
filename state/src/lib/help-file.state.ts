import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { HelpFileService } from '@sotbi/data-access';
import { HelpFile } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddEmptyHelpFile,
  AddHelpFile,
  DeleteHelpFile,
  FetchHelpFiles,
  StartEditHelpFile,
  UpdateHelpFile,
} from './help-file.actions';

export interface HelpFileStateModel {
  items: HelpFile[];
  loading: boolean;
  count: number;
}

@State<HelpFileStateModel>({
  name: 'help_file',
  defaults: {
    items: [],
    loading: false,
    count: 0,
  },
})
@Injectable()
export class HelpFileState {
  private readonly itemsService = inject(HelpFileService);

  private readonly rowData = new HelpFile();

  @Selector()
  public static getLoading(state: HelpFileStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getItems(state: HelpFileStateModel): HelpFile[] {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<HelpFileStateModel>) {
    dispatch(new FetchHelpFiles());
  }

  @Action(FetchHelpFiles)
  public FetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<HelpFileStateModel>) {
    // console.log('HelpFileStateModel::FetchItems');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.itemsService.GetAll().pipe(
        tap((items) => {
          items = items.map((el) => {
            el.dirty = false;
            return el;
          });
          setState({
            ...state,
            items,
            count: items.length,
          });
        }),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
    return of([]);
  }

  @Action(AddHelpFile)
  public createItem(
    { getState, patchState, setState }: StateContext<HelpFileStateModel>,
    { payload }: AddHelpFile,
  ) {
    // console.log('HelpFileStateModel::AddItem', payload);
    patchState({ loading: true });
    const { item, idx } = payload;
    return this.itemsService.add(removeID(item)).pipe(
      tap((result) => {
        const state = getState();
        result.dirty = false;
        state.items[idx] = result;
        setState({
          ...state,
          items: [...state.items],
          count: state.count++,
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(AddEmptyHelpFile)
  public addEmptyItem({
    getState,
    patchState,
  }: StateContext<HelpFileStateModel>) {
    const state = getState();
    const item = Object.assign({}, this.rowData);
    state.count++;
    return patchState({ items: [...state.items, item], count: state.count });
  }

  @Action(UpdateHelpFile)
  public UpdateItem(
    { getState, setState, patchState }: StateContext<HelpFileStateModel>,
    { payload }: UpdateHelpFile,
  ) {
    // console.log('HelpFileStateModel::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        selected.dirty = false;
        const idx = state.items.findIndex(({ id }) => id === selected.id);
        state.items[idx] = selected;
        setState({
          ...state,
          items: state.items,
        });
        patchState({ items: state.items });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(StartEditHelpFile)
  public editItem(
    { getState, patchState }: StateContext<HelpFileStateModel>,
    { payload }: StartEditHelpFile,
  ) {
    const state = getState();
    if (payload > 0) {
      state.items[payload - 1].dirty = true;
      return patchState({ items: state.items });
    }
  }

  @Action(DeleteHelpFile)
  public deleteItem(
    { getState, patchState, setState }: StateContext<HelpFileStateModel>,
    { payload }: DeleteHelpFile,
  ) {
    // console.log('HelpFileStateModel::DeleteItem', payload);
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        setState({
          ...state,
          items,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }
}
