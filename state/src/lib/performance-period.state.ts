import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { PerformancePeriodService } from '@sotbi/data-access';
import type { PerformancePeriod } from '@sotbi/models';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { PerformancePeriodAction } from './performance-period.actions';

export interface PerformancePeriodStateModel {
  items: PerformancePeriod[];
  loading: boolean;
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

  @Action(PerformancePeriodAction)
  public add(
    {
      patchState,
      getState,
      setState,
    }: StateContext<PerformancePeriodStateModel>,
    { payload }: PerformancePeriodAction,
  ) {
    return this.performancePeriodSrv.add(payload).pipe(
      tap((item: PerformancePeriod) => {
        const state = getState();
        setState({
          ...state,
          items: [...state.items, item],
          loading: false,
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
}
