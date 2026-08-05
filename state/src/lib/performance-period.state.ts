import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { PerformancePeriodService } from '@sotbi/data-access';
import type { PerformancePeriod } from '@sotbi/models';
import { catchError, finalize, of, tap, throwError } from 'rxjs';
import {
  PerformancePeriodAddOrPutAction,
  PerformancePeriodGetActions,
} from './performance-period.actions';

export class PerformancePeriodStateModel {
  public items: PerformancePeriod[] = [];
  public loading = false;
}

@State<PerformancePeriodStateModel>({
  name: 'performancePeriod',
  defaults: {
    items: [],
    loading: false,
  },
})
@Injectable()
export class PerformancePeriodState {
  private readonly performancePeriodSrv = inject(PerformancePeriodService);

  @Selector()
  public static getItems(state: PerformancePeriodStateModel) {
    return state.items;
  }

  @Selector()
  public static loading(state: PerformancePeriodStateModel) {
    return state.loading;
  }

  @Action(PerformancePeriodAddOrPutAction)
  public addOrPut(
    {
      patchState,
      getState,
      setState,
    }: StateContext<PerformancePeriodStateModel>,
    { payload }: PerformancePeriodAddOrPutAction,
  ) {
    patchState({ loading: true });

    const { id, ...data } = payload;
    const request = id
      ? this.performancePeriodSrv.update(payload)
      : this.performancePeriodSrv.addItem(data);
    return request.pipe(
      tap((item: PerformancePeriod) => {
        const state = getState();
        const items = [...state.items];
        const idx = state.items.findIndex(
          ({ year, month }) => year === item.year && month === item.month,
        );
        if (idx !== -1) {
          items[idx] = item;
        } else {
          items.push(item);
        }
        setState({
          ...state,
          items,
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

  @Action(PerformancePeriodGetActions)
  public get({
    patchState,
    getState,
  }: StateContext<PerformancePeriodStateModel>) {
    if (getState().items?.length === 0) {
      patchState({ loading: true });
      return this.performancePeriodSrv.getAll().pipe(
        tap((items) => {
          items.forEach((item) => {
            item.starts_at = new Date(item.starts_at);
            item.ends_at = new Date(item.ends_at);
            item.starts_at.setHours(0, 0, 0, 0);
            item.ends_at.setHours(23, 59, 59, 999);
          });
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
