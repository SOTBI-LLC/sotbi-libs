import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import type { SelectedPeriod, UserPerformance } from '@sotbi/models';
import { UserPerformanceService } from '@sotbi/data-access';
import { catchError, finalize, of, tap, throwError } from 'rxjs';
import {
  UserPerformanceGetActions,
  UserPerformanceSelectPeriod,
  UserPerformanceUpsertAction,
} from './user-performance.actions';

export class UserPerformanceStateModel {
  public items: UserPerformance[] = [];
  public loading = false;
  public selectedPeriod: SelectedPeriod | null = null;
}

@State<UserPerformanceStateModel>({
  name: 'userPerformance',
  defaults: {
    items: [],
    loading: false,
    selectedPeriod: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
  },
})
// check: нужен ли ADD-action ?
@Injectable()
export class UserPerformanceState {
  private readonly userPerformanceSrv = inject(UserPerformanceService);

  @Selector()
  public static getItems(state: UserPerformanceStateModel) {
    return state.items;
  }

  @Selector()
  public static getLoading(state: UserPerformanceStateModel) {
    return state.loading;
  }

  @Selector()
  public static getSelectedPeriod(state: UserPerformanceStateModel) {
    return state.selectedPeriod;
  }

  @Action(UserPerformanceUpsertAction)
  public add(
    { getState, patchState }: StateContext<UserPerformanceStateModel>,
    { payload }: UserPerformanceUpsertAction,
  ) {
    patchState({ loading: true });
    return this.userPerformanceSrv.upsert(payload).pipe(
      tap((item: UserPerformance) => {
        const items = [...getState().items];
        const idx = items.findIndex(({ id }) => id === item.id);
        if (idx !== -1) {
          items[idx] = item;
        } else {
          items.push(item);
        }
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
  }

  @Action(UserPerformanceGetActions)
  public get(
    { patchState, getState }: StateContext<UserPerformanceStateModel>,
    { payload }: UserPerformanceGetActions,
  ) {
    if (getState().items.length === 0) {
      patchState({ loading: true });
      return this.userPerformanceSrv.getAll(payload).pipe(
        tap((response: { items: UserPerformance[] }) => {
          if (response?.items) {
            patchState({ items: response.items });
          } else {
            patchState({ items: [] });
          }
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

  @Action(UserPerformanceSelectPeriod)
  public selectPeriod(
    { patchState }: StateContext<UserPerformanceStateModel>,
    { payload }: UserPerformanceSelectPeriod,
  ) {
    patchState({ selectedPeriod: payload });
  }
}
