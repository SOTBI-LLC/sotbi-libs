import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { PerformanceCriteriaService } from '@sotbi/data-access';
import type { PerformanceCriteria } from '@sotbi/models';
import { catchError, finalize, of, tap, throwError } from 'rxjs';
import {
  PerformanceCriteriaAddAction,
  PerformanceCriteriaGetActions,
  PerformanceCriteriaPutAction,
} from './performance-criteria.actions';

export class PerformanceCriteriaStateModel {
  public items: PerformanceCriteria[] = [];
  public loading = false;
}

@State<PerformanceCriteriaStateModel>({
  name: 'performanceCriteria',
  defaults: {
    items: [],
    loading: false,
  },
})
@Injectable()
export class PerformanceCriteriaState {
  private readonly performanceCriteriaSrv = inject(PerformanceCriteriaService);

  @Selector()
  public static getItems(state: PerformanceCriteriaStateModel) {
    return state.items;
  }

  @Selector()
  public static getLoading(state: PerformanceCriteriaStateModel) {
    return state.loading;
  }

  @Action(PerformanceCriteriaAddAction)
  public add(
    { getState, patchState }: StateContext<PerformanceCriteriaStateModel>,
    { payload }: PerformanceCriteriaAddAction,
  ) {
    patchState({ loading: true });
    return this.performanceCriteriaSrv.add(payload).pipe(
      tap((item: PerformanceCriteria) => {
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

  @Action(PerformanceCriteriaGetActions)
  public get({
    patchState,
    getState,
  }: StateContext<PerformanceCriteriaStateModel>) {
    if (getState().items.length === 0) {
      patchState({ loading: true });
      return this.performanceCriteriaSrv.GetAll().pipe(
        tap((items: PerformanceCriteria[]) => {
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

  @Action(PerformanceCriteriaPutAction)
  public put(
    { getState, patchState }: StateContext<PerformanceCriteriaStateModel>,
    { payload }: PerformanceCriteriaPutAction,
  ) {
    patchState({ loading: true });
    return this.performanceCriteriaSrv.update(payload).pipe(
      tap((item: PerformanceCriteria) => {
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
}
