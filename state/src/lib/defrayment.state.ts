import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { DefraymentService } from '@sotbi/data-access';
import type { Defrayment } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddDefrayment,
  DeleteDefrayment,
  GetAllDefrayments,
  GetDefrayment,
  UpdateDefrayment,
} from './defrayment.actions';

export interface DefraymentStateModel {
  items: Defrayment[];
  selected: Defrayment | null;
  loading: boolean;
  count: number;
}

@State<DefraymentStateModel>({
  name: 'defrayment',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class DefraymentState {
  private readonly itemsService = inject(DefraymentService);

  @Selector()
  public static getLoading(state: DefraymentStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: DefraymentStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: DefraymentStateModel): Defrayment[] {
    return state.items;
  }

  @Action(GetAllDefrayments)
  public GetAllItems(
    { getState, setState, patchState }: StateContext<DefraymentStateModel>,
    { payload }: GetAllDefrayments,
  ) {
    // console.log('DefraymentState::FetchItems');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      this.itemsService.GetAll(payload).pipe(
        tap((items) => {
          setState({
            ...state,
            selected: null,
            items,
            count: items.length,
          });
        }),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(GetDefrayment)
  public getItem(
    { patchState }: StateContext<DefraymentStateModel>,
    { payload }: GetDefrayment,
  ) {
    patchState({ loading: true });
    if (!payload) {
      const selected: Defrayment = {
        id: 0,
        payment_request_id: 0,
        summ: 0,
        payment_purpose: '',
        priority: 5,
        creator_id: 0,
      };
      return patchState({ selected });
    } else {
      return this.itemsService.get(payload).pipe(
        tap((item) => patchState({ selected: item })),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(AddDefrayment)
  public createItem(
    { getState, patchState, setState }: StateContext<DefraymentStateModel>,
    { payload }: AddDefrayment,
  ) {
    // console.log('DefraymentState::AddItem', payload);
    patchState({ loading: true });
    return this.itemsService.add(removeID(payload)).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [result, ...state.items],
          selected: result,
          count: state.count++,
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateDefrayment)
  public UpdateItem(
    { getState, setState, patchState }: StateContext<DefraymentStateModel>,
    { payload }: UpdateDefrayment,
  ) {
    // console.log('DefraymentState::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const idx = state.items.findIndex(({ id }) => id === selected.id);
        state.items[idx] = selected;
        setState({
          ...state,
          items: state.items,
          selected,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteDefrayment)
  public deleteItem(
    { getState, patchState, setState }: StateContext<DefraymentStateModel>,
    { payload }: DeleteDefrayment,
  ) {
    // console.log('DefraymentState::DeleteItem', payload);
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
