import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { PerformancePeriodService } from '@sotbi/data-access';
import type { PerformancePeriod } from '@sotbi/models';
import { catchError, finalize, of, tap, throwError } from 'rxjs';
import {
  PerformancePeriodGetActions,
  PerformancePeriodAddOrPutAction,
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
  public static getState(state: PerformancePeriodStateModel) {
    return state;
  }

  @Selector()
  public static getItems(state: PerformancePeriodStateModel) {
    return state.items;
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
    patchState({ loading: true });
    if (getState().items.length === 0) {
      return this.performancePeriodSrv.getAll().pipe(
        tap((response: { items: PerformancePeriod[] }) => {
          patchState({ items: response.items });
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
