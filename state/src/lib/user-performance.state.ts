import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import type { UserPerformance } from '@sotbi/models';
import { UserPerformanceService } from 'data-access/src/lib/motivation.service';
import { catchError, finalize, of, tap, throwError } from 'rxjs';
import {
  UserPerformanceGetActions,
  UserPerformanceUpsertAction,
} from './user-performance.actions';

export class UserPerformanceStateModel {
  public items: UserPerformance[] = [];
  public loading = false;
}

@State<UserPerformanceStateModel>({
  name: 'userPerformance',
  defaults: {
    items: [],
    loading: false,
  },
})
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
        tap((items: UserPerformance[]) => {
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
