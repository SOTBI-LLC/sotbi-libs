import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { CalendarService } from '@sotbi/data-access';
import type { Calendar } from '@sotbi/models';
import { deepFlatten } from '@sotbi/utils';
import { isSameDay } from 'date-fns';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  GetActivePeriods,
  GetMonth,
  RefreshPeriod,
  TogglePeriod,
} from './calendar.actions';

export class SelectedCalendar {
  public selected: Calendar | null = null;
  public workingDays: number[] = [];
}

export class CalendarStateModel {
  public items: Calendar[] = [];
  public selected: Calendar | null = null;
  public dates: Date[] = [];
  public workingDays: number[] = [];
  public loading = false;
}

@State<CalendarStateModel>({
  name: 'calendar',
  defaults: {
    items: [],
    selected: null,
    dates: [],
    workingDays: [],
    loading: false,
  },
})
@Injectable()
export class CalendarState {
  private readonly itemsService = inject(CalendarService);

  @Selector()
  public static getActivePeriods(state: CalendarStateModel) {
    return state?.items ?? [];
  }

  @Selector()
  public static getHistoryPeriods(state: CalendarStateModel) {
    const historyDates = state?.items?.map((el) => el.first_day_month) ?? [];
    historyDates.shift();
    return historyDates;
  }

  @Selector()
  public static getSelected(state: CalendarStateModel): SelectedCalendar {
    return {
      selected: state?.selected ?? null,
      workingDays: state?.workingDays ?? [],
    } as SelectedCalendar;
  }

  @Selector()
  public static loading(state: CalendarStateModel): boolean {
    return state?.loading ?? false;
  }

  @Selector()
  public static getToday(state: CalendarStateModel) {
    return state?.selected?.first_day_month;
  }

  @Selector()
  public static editable(state: CalendarStateModel) {
    return state?.selected?.editable ?? false;
  }

  @Selector()
  public static getWorkingDays(state: CalendarStateModel) {
    return state?.workingDays ?? [];
  }

  @Selector()
  public static getHolidays(state: CalendarStateModel) {
    return state?.selected?.holidays ?? [];
  }

  @Selector()
  public static workDays(state: CalendarStateModel) {
    return state?.selected?.working_days ?? [];
  }

  @Action(GetActivePeriods, { cancelUncompleted: true })
  public getActivePeriods(
    { setState, getState, patchState }: StateContext<CalendarStateModel>,
    { payload }: GetActivePeriods,
  ) {
    const state = getState();
    if (payload || (!state.loading && !state.items.length)) {
      patchState({ loading: true });
      return this.itemsService.GetCalendarActive(payload).pipe(
        tap((result) => {
          const items = result.map((el) => {
            el.first_day_month = new Date(el.first_day_month);
            return el;
          });
          const dates = items.map((el) => el.first_day_month);
          const selected = { ...items[0] };
          if (selected) {
            selected.holidays = selected.holidays.map((el) => new Date(el));
          }
          setState({
            ...state,
            items,
            dates,
            selected,
            workingDays: deepFlatten(items[0].working_days).map((el: Date) =>
              new Date(el).getDate(),
            ),
          });
        }),
        finalize(() => patchState({ loading: false })),
        catchError((err) => {
          return throwError(() => err);
        }),
      );
    }
    return;
  }

  @Action(GetMonth)
  public getMonth(
    { setState, getState }: StateContext<CalendarStateModel>,
    { payload }: GetMonth,
  ) {
    const state = getState();
    let holidays: Date[] = [];
    const selected = state.items.find(({ month }) => month === payload);
    holidays = selected?.holidays?.map((el) => new Date(el)) ?? [];
    const workingDays =
      selected &&
      deepFlatten(selected?.working_days).map((el: Date) =>
        new Date(el).getDate(),
      );
    setState({
      ...state,
      selected: { ...selected, holidays } as Calendar,
      workingDays: workingDays ?? [],
    });
  }

  @Action(TogglePeriod)
  public togglePeriod(
    { patchState }: StateContext<CalendarStateModel>,
    { payload }: TogglePeriod,
  ) {
    patchState({ loading: true });
    return this.itemsService
      .togglePeriod(
        payload.first_day_month ?? new Date(),
        payload.editable ?? false,
      )
      .pipe(
        tap((result) => {
          patchState({
            items: result.map((el) => {
              el.first_day_month = new Date(el.first_day_month);
              return el;
            }),
            selected: result.find(
              ({ month }: Calendar) => month === payload.month,
            ),
          });
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
  }

  @Action(RefreshPeriod)
  public refreshPeriod(
    { patchState, getState, setState }: StateContext<CalendarStateModel>,
    { payload }: RefreshPeriod,
  ) {
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.refreshPeriod(payload).pipe(
      tap((selected) => {
        selected.first_day_month = new Date(selected.first_day_month);
        const items = state.items.map((el) =>
          isSameDay(el.first_day_month, payload) ? selected : el,
        );
        setState({
          ...state,
          items,
          selected,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
