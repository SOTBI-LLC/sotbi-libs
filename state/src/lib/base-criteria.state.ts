import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { BaseCriteriaService } from '@sotbi/data-access';
import type { BaseCriteria } from '@sotbi/models';
import { catchError, finalize, of, tap, throwError } from 'rxjs';
import {
  BaseCriteriaAddAction,
  BaseCriteriaGetActions,
  BaseCriteriaPutAction,
} from './base-criteria.actions';

export interface BaseCriteriaStateModel {
  items: BaseCriteria[];
  loading: boolean;
}

@State<BaseCriteriaStateModel>({
  name: 'baseCriteria',
  defaults: {
    items: [],
    loading: false,
  },
})
@Injectable()
export class BaseCriteriaState {
  private readonly baseCriteriaSrv = inject(BaseCriteriaService);
  @Selector()
  public static getItems(state: BaseCriteriaStateModel) {
    return state.items;
  }

  @Selector()
  public static getLoading(state: BaseCriteriaStateModel) {
    return state.loading;
  }

  @Action(BaseCriteriaAddAction)
  public add(
    { getState, patchState }: StateContext<BaseCriteriaStateModel>,
    { payload }: BaseCriteriaAddAction,
  ) {
    patchState({ loading: true });
    return this.baseCriteriaSrv.add(payload).pipe(
      tap((item: BaseCriteria) => {
        patchState({ items: [...getState().items, item] });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(BaseCriteriaPutAction)
  public put(
    { getState, patchState }: StateContext<BaseCriteriaStateModel>,
    { payload }: BaseCriteriaPutAction,
  ) {
    patchState({ loading: true });
    return this.baseCriteriaSrv.update(payload).pipe(
      tap((item: BaseCriteria) => {
        patchState({
          items: getState().items.map((el) => (el.id === item.id ? item : el)),
        });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(BaseCriteriaGetActions)
  public get({ patchState, getState }: StateContext<BaseCriteriaStateModel>) {
    if (getState().items.length === 0) {
      patchState({ loading: true });
      return this.baseCriteriaSrv.getAll().pipe(
        tap((items: BaseCriteria[]) => {
          patchState({ items });
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
        finalize(() => {
          patchState({ loading: false });
        }),
      );
    } else {
      return of(getState().items);
    }
  }
}
