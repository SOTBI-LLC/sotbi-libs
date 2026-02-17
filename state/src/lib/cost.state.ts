import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { EventInput, EventSourceInput } from '@fullcalendar/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { CostRealService } from '@sotbi/data-access';
import type { CostReal, CostRealFilter, Interval } from '@sotbi/models';
import { calcSumHours } from '@sotbi/models';
import { canSave, formatEventDuraton, isAllSaved } from '@sotbi/utils';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddAbsenceCostsReal,
  AddCostReal,
  AddEmptyCostsReal,
  CancelAllCostReal,
  CancelCostReal,
  DeleteCostReal,
  EditCostReal,
  EmptyCostReal,
  EmptyCostsReal,
  FetchCostsReal,
  FilterCostsReal,
  SaveAllCostReal,
  UpdateCostReal,
} from './cost.actions';

export const CostRequiredFields = [
  'date',
  'debtor_id',
  'minutes_costs',
  // 'description',
  // 'work_category_id',
];

const makeEvent = (cost: CostReal): EventInput => {
  const res = {
    id: cost.id + '',
    start: new Date(cost.date),
    title: '',
    allDay: true,
    extendedProps: {
      duration: cost.minutes_costs,
    },
  } as EventInput;
  if (cost.debtor?.name.includes('Отпуск')) {
    res.title = 'Отпуск';
    if (res.extendedProps) {
      res.extendedProps['duration'] = 0;
    }
    res['eventColor'] = '#a6adb4';
  } else if (cost.debtor?.name.includes('Больничный')) {
    res.title = 'Больничный';
    if (res.extendedProps) {
      res.extendedProps['duration'] = 0;
    }
    res['eventColor'] = '#a6adb4';
  } else {
    res.title = formatEventDuraton(cost.minutes_costs);
  }
  return res;
};

const mergeEvent = (old: EventInput, cost: CostReal): EventInput => {
  const newDuration =
    +(old.extendedProps?.['duration'] ?? 0) + cost.minutes_costs;
  const res = {
    id: old.id,
    start: old.start,
    title: formatEventDuraton(newDuration),
    allDay: true,
    extendedProps: {
      duration: newDuration,
    },
  } as EventInput;
  if (old.title === 'Отпуск' || old.title === 'Больничный') {
    if (res.extendedProps) {
      res.extendedProps['duration'] = 0;
    }
    res.title = old.title;
    // res.rendering = 'background';
    res.backgroundColor = '#a6adb4';
  }
  return res;
};

const compareCost = (a: CostReal, b: CostReal): number => {
  const aDate = new Date(a.date);
  const bDate = new Date(b.date);
  if (isBefore(aDate, bDate)) {
    return 1;
  }
  if (isAfter(aDate, bDate)) {
    return -1;
  }
  if (isSameDay(aDate, bDate)) {
    if ((a.debtor?.name ?? '') < (b.debtor?.name ?? '')) {
      return -1;
    }
    if ((a.debtor?.name ?? '') > (b.debtor?.name ?? '')) {
      return 1;
    }
    if ((a.debtor?.name ?? '') === (b.debtor?.name ?? '')) {
      return 0;
    }
  }
  return 0;
};

const makeEvents = (inCosts: CostReal[]): EventSourceInput => {
  if (inCosts.length > 0) {
    const costs = [...inCosts];
    costs.sort(compareCost);
    const events: EventInput[] = [makeEvent(costs[0])];
    for (let i = 1; i < costs.length; i++) {
      const idx = events.length - 1;
      if (isSameDay(events[idx].start as Date, costs[i].date)) {
        if (
          events[idx].title === 'Отпуск' ||
          events[idx].title === 'Больничный'
        ) {
          if (
            costs[i].debtor?.name.includes('Отпуск') ||
            costs[i].debtor?.name.includes('Больничный')
          ) {
            events[idx] = mergeEvent(events[idx], costs[i]);
          } else {
            events.push(makeEvent(costs[i]));
          }
        } else {
          events[idx] = mergeEvent(events[idx], costs[i]);
        }
      } else {
        events.push(makeEvent(costs[i]));
      }
    }
    return events;
  } else {
    return [];
  }
};

export class CostRealStateModel {
  public allItems: CostReal[] = [];
  public items: CostReal[] = [];
  public loading = false;
  public saved = true;
  public lastSaved = 0;
}

@State<CostRealStateModel>({
  name: 'costReal',
  defaults: {
    allItems: [],
    items: [],
    loading: false,
    saved: true,
    lastSaved: 0,
  },
})
@Injectable()
export class CostRealState {
  private readonly service = inject(CostRealService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly rowData: CostReal = {
    id: 0,
    date: new Date(),
    debtor_id: 0,
    user_id: null,
    work_category_id: 0,
    description: null,
    minutes_costs: 0,
    dirty: true,
    user: null,
    debtor: null,
    work_category: null,
    rowId: null,
  };

  @Selector()
  public static loading(state: CostRealStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static lastSavedCount(state: CostRealStateModel): number {
    return state.lastSaved;
  }

  @Selector()
  public static saved(state: CostRealStateModel): boolean {
    return state.saved;
  }

  @Selector()
  public static getItems(state: CostRealStateModel): CostReal[] {
    return state.items;
  }
  @Selector()
  public static getAllItems(state: CostRealStateModel): CostReal[] {
    return state.allItems;
  }

  @Selector()
  public static canSave(state: CostRealStateModel): boolean {
    return canSave(state.items, CostRequiredFields);
  }

  @Selector()
  public static getEvents(state: CostRealStateModel): EventSourceInput {
    return makeEvents(state.allItems);
  }

  @Selector()
  public static getHours(state: CostRealStateModel): string {
    return formatEventDuraton(calcSumHours(state.items));
  }

  @Action(FetchCostsReal)
  public fetchItems(
    { getState, setState, patchState }: StateContext<CostRealStateModel>,
    { payload }: FetchCostsReal,
  ) {
    patchState({ loading: true });
    const state = getState();
    const filter: CostRealFilter = {
      period: payload,
      users: [],
      debtors: [],
      units: [],
    };
    let rowId = 0;
    // TODO:
    // Incorrect operator chaining syntax in `cost.state.ts` RxJS pipe
    // The RxJS pipe has misplaced parentheses wrapping catchError and tap operators
    // with a comma between them, creating invalid operator syntax.
    // The pipe expects operator functions, not a comma expression result.
    return this.service.getRealCosts(filter).pipe(
      (catchError((err) => {
        console.error(err.message);
        return throwError(() => err);
      }),
      tap((allItems) => {
        allItems = allItems.map((el) => {
          return {
            ...el,
            dirty: false,
            date: new Date(el.date),
            rowId: rowId++ + '',
          };
        });
        setState({
          ...state,
          allItems,
          saved: true,
        });
      })),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(FilterCostsReal, { cancelUncompleted: false })
  public filterItems(
    { getState, patchState, setState }: StateContext<CostRealStateModel>,
    { payload }: FilterCostsReal,
  ) {
    // console.log('CostRealState::FilterCostsReal', payload);
    patchState({ loading: true });
    const interval = payload as Interval;
    const state = getState();
    let rowId = 0;
    const items = state.allItems
      .filter((el) => interval.end >= el.date && el.date >= interval.start)
      .map((el) => {
        return {
          ...el,
          dirty: false,
          date: new Date(el.date),
          rowId: rowId++ + '',
        };
      });
    const empty = [];
    for (let index = 0; index < 10; index++) {
      empty.push({ ...this.rowData, rowId: rowId++ + '' });
    }
    setState({
      ...state,
      items: [...items, ...empty],
      saved: true,
    });
    return patchState({ loading: false });
  }

  @Action(AddCostReal)
  public addItem(
    { getState, setState }: StateContext<CostRealStateModel>,
    { payload }: AddCostReal,
  ) {
    const { cost } = payload;
    return this.service.createCostReal(cost).pipe(
      tap((result) => {
        const state = getState();
        result = {
          ...result,
          dirty: false,
          date: new Date(result.date),
          description: result.description,
          rowId: cost.rowId,
        };
        const items = state.items.map((item) => {
          if (item.rowId === result.rowId) {
            return result;
          }
          return item;
        });
        return setState({
          ...state,
          items,
          // items: [...state.items, { ...result, rowId: items.length + '' }],
          allItems: [...state.allItems, result],
          saved: isAllSaved(items),
        });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(AddAbsenceCostsReal)
  public addAbsenceItem(
    { getState, setState, dispatch }: StateContext<CostRealStateModel>,
    { payload }: AddAbsenceCostsReal,
  ) {
    const { days, debtor, interval } = payload;
    const state = getState();
    const costs: CostReal[] = [];
    const idxs: Map<number, number> = new Map();
    // для указанного диапазона
    for (const day of days) {
      const hasAbsence = state.allItems.findIndex(
        ({ date, debtor: dbt }) =>
          new Date(date)?.getDate() === day &&
          (debtor.id === dbt?.id || debtor.category_id === dbt?.category_id),
      );
      if (hasAbsence > -1) {
        const rowData = state.allItems[hasAbsence];
        idxs.set(rowData.id, hasAbsence);
        costs.push({
          ...rowData,
          minutes_costs: 8 * 60,
          work_category_id: 0,
          debtor_id: debtor.id ?? 0,
        });
      } else {
        const rowData: CostReal = {
          id: 0,
          date: new Date(
            interval.start.getFullYear(),
            interval.start.getMonth(),
            day,
            0,
            0,
            0,
          ),
          debtor_id: debtor.id ?? 0,
          user_id: null,
          work_category_id: 0,
          minutes_costs: 8 * 60,
          description: null,
          dirty: true,
          user: null,
          debtor: null,
          work_category: null,
          rowId: null,
        };
        costs.push(rowData);
      }
    }
    const allItems = [...state.allItems];
    // prettier-ignore
    return this.service.batchUpdate(costs).pipe(
      tap((items: CostReal[]) => {
        for (const item of items) {
          if (idxs.has(item.id)) {
            allItems[idxs.get(item.id) ?? 0] = item; // если ранее был сохранен, то обновляем
          } else {
            allItems.push(item); // иначе добавляем
          }
        }
        setState({
          ...state,
          allItems,
          saved: true,
          lastSaved: items.length,
        });
        return dispatch(new FilterCostsReal(interval));
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  @Action(AddEmptyCostsReal)
  public addEmptyItems(
    { getState, setState }: StateContext<CostRealStateModel>,
    { payload }: AddEmptyCostsReal,
  ) {
    const empty = [];
    const state = getState();
    let rowId = state.items.length;
    for (let index = 0; index < payload; index++) {
      empty.push({ ...this.rowData, rowId: rowId++ + '' });
    }
    return setState({
      ...state,
      items: [...state.items, ...empty],
      lastSaved: 0,
    });
  }

  @Action(EmptyCostsReal)
  public emptyPeriod({ getState, setState }: StateContext<CostRealStateModel>) {
    const state = getState();
    return setState({
      ...state,
      items: [],
      loading: false,
      saved: true,
      lastSaved: 0,
    });
  }

  @Action(EditCostReal)
  public editItem(
    { getState, setState }: StateContext<CostRealStateModel>,
    { payload }: EditCostReal,
  ) {
    console.log('CostRealState::EditCostReal', payload);
    const { cost, idx } = payload;
    const state = getState();
    const items = [...state.items];
    items[idx] = { ...cost, dirty: true };
    return setState({
      ...state,
      items,
      saved: false,
      lastSaved: 0,
    });
  }

  @Action(CancelCostReal)
  public cancelItem(
    { getState, setState, dispatch }: StateContext<CostRealStateModel>,
    { payload }: CancelCostReal,
  ) {
    // console.log('CostRealState::CancelCostReal', payload);
    const state = getState();
    const idx = state.items[payload].id;
    if (idx > 0) {
      const items = [...state.items];
      const index = state.allItems.findIndex(({ id }) => id === idx);
      items[payload] = state.allItems[index];
      return setState({
        ...state,
        items,
        saved: isAllSaved(state.items),
        lastSaved: 0,
      });
    } else {
      return dispatch(new EmptyCostReal(payload));
    }
  }

  @Action(UpdateCostReal, { cancelUncompleted: true })
  public updateItem(
    { getState, setState }: StateContext<CostRealStateModel>,
    { payload }: UpdateCostReal,
  ) {
    // console.log('CostRealState::UpdateCostReal', payload);
    const { cost, idx } = payload;
    return this.service.updateCostReal(cost).pipe(
      // prettier-ignore
      tap((result: CostReal) => {
        const state = getState();
        const items = [...state.items];
        const allItems = [...state.allItems];
        result = { ...result, dirty: false, date: new Date(result.date), rowId: idx + '' };
        items[idx] = result;
        const index = state.allItems.findIndex(({ id }) => id === result.id);
        allItems[index] = result;
        return setState({
          ...state,
          items,
          allItems,
          saved: isAllSaved(items),
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  @Action(SaveAllCostReal)
  public saveAllItems({
    getState,
    patchState,
  }: StateContext<CostRealStateModel>) {
    patchState({ loading: true });
    const state = getState();
    // console.log('CostRealState::SaveAllCostReal', state.items);
    const costs: CostReal[] = [];
    const idxs: Map<number, number> = new Map(); // храним соотвествие index в ag-grid и id в бд
    const fields = new Set(CostRequiredFields);
    const items = [...state.items];
    for (const item of items) {
      if (item.dirty) {
        // для всех не сохраненных
        let filledFields = 0;
        for (const key of fields) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            const v = item[key as keyof CostReal];
            if (v !== null && v !== undefined && v !== '' && v !== 0) {
              filledFields++; // считаем количество заполненных полей
            }
          }
        }
        // если все обязательные поля заполнены
        if (filledFields >= fields.size) {
          costs.push(item); // заполняем массив для отправки на сервре для сохранения
          idxs.set(+(item.rowId ?? 0), item.id); // запоминаем какому индексу в ag-grid соответствует id в таблице
        }
      }
    }
    const allItems = state.allItems.map((el, i) => {
      return {
        ...el,
        dirty: false,
        date: new Date(el.date),
        rowId: i + '',
      } as CostReal;
    });
    // prettier-ignore
    return this.service.batchUpdate(costs).pipe(
      tap((result: CostReal[]) => {
        let i = 0;
        for (const [key, value] of idxs) {
          items[key] = result[i];
          if (value > 0) {
            // если ранее был сохранен, то обновляем
            const index = allItems.findIndex(({ id }) => id === value);
            allItems[index] = result[i];
          } else {
            // иначе добавляем
            allItems.push(result[i]);
          }
          i++;
        }

        return patchState({
          items,
          allItems,
          saved: isAllSaved(items),
          lastSaved: result.length,
        });
      }),
      catchError((err) => {
        patchState({ loading: false, lastSaved: 0 });
        return throwError(() => err);
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(CancelAllCostReal)
  public cancelAll({
    getState,
    patchState,
    setState,
  }: StateContext<CostRealStateModel>) {
    patchState({ loading: true });
    const state = getState();
    const items = [...state.items];
    for (let item of items) {
      if (item.id > 0) {
        const index = state.allItems.findIndex(({ id }) => id === item.id);
        item = { ...state.allItems[index] };
      } else {
        item = { ...this.rowData };
      }
    }
    return setState({
      ...state,
      items,
      loading: false,
      saved: true,
    });
  }

  @Action(DeleteCostReal, { cancelUncompleted: true })
  public deleteItem(
    { getState, setState, patchState }: StateContext<CostRealStateModel>,
    { payload }: DeleteCostReal,
  ) {
    const { id } = payload;
    // const snackBarRef = this.snackBar.open(
    //   'Запись удалена! Если передумали то можно',
    //   'отменить!',
    //   {
    //     duration: 3000,
    //   },
    // );
    const state = getState();
    const items = state.items.filter((el) => el.id !== id);
    const allItems = state.allItems.filter((el) => el.id !== id);
    patchState({
      items,
      allItems,
      saved: isAllSaved(items),
    });
    return this.service.deleteCostReal(id).subscribe({
      next: () => {
        setState({
          ...state,
          items,
          allItems,
          saved: isAllSaved(items),
          lastSaved: 1,
        });
      },
      error: (err) => throwError(() => err),
    });
    // snackBarRef.onAction().subscribe(() => {
    //   items.splice(idx, 0, item);
    //   allItems.splice(idx, 0, item);
    //   patchState({
    //     items,
    //     allItems,
    //     saved: isAllSaved(items),
    //   });
    //   return dispatch(new FilterCostsReal(interval));
    // });
    // return snackBarRef.afterDismissed().subscribe(({ dismissedByAction }) => {
    //   if (!dismissedByAction) {
    //   }
    // });
  }

  @Action(EmptyCostReal)
  public emptyItem(
    { getState, setState }: StateContext<CostRealStateModel>,
    { payload }: EmptyCostReal,
  ) {
    // console.log('CostRealState::EmptyCostReal', payload);
    const state = getState();
    const items = [...state.items];
    items[payload] = { ...this.rowData };
    return setState({
      ...state,
      items,
      saved: isAllSaved(items),
    });
  }
}
