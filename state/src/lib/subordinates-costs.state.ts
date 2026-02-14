import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { CostRealService } from '@sotbi/data-access';
import type {
  CostReal,
  CostRealFilter,
  Debtor,
  Project,
  Staff,
} from '@sotbi/models';
import { calcSumHours } from '@sotbi/models';
import { formatEventDuraton, uniqueElementsBy } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  FetchSubordinatesCosts,
  SetSubordinatesFilter,
} from './subordinates-costs.actions';

export class SubordinatesCostsStateModel {
  public items: CostReal[] = [];
  public filter: CostRealFilter | null = null;
  public count = 0;
  public loading = false;
}

@State<SubordinatesCostsStateModel>({
  name: 'subordinates_costs',
  defaults: {
    items: [],
    count: 0,
    loading: false,
    filter: {
      period: {
        start: new Date(),
        end: new Date(),
      },
      users: [],
      debtors: [],
      units: [],
    },
  },
})
@Injectable()
export class SubordinatesCostsState {
  private readonly costsService = inject(CostRealService);

  @Selector()
  public static getFilter(state: SubordinatesCostsStateModel) {
    return state.filter;
  }

  @Selector()
  public static loading(state: SubordinatesCostsStateModel) {
    return state.loading;
  }

  @Selector()
  public static getItems(state: SubordinatesCostsStateModel) {
    return state.items;
  }

  @Selector()
  public static getHours(state: SubordinatesCostsStateModel) {
    return formatEventDuraton(calcSumHours(state.items));
  }

  @Selector()
  public static getUnits(state: SubordinatesCostsStateModel): Staff[] {
    // console.log(state.filter);
    const allUsers = uniqueElementsBy(
      state.items.map((el: CostReal) => el.user),
      (a, b) => a?.id === b?.id,
    );
    const units = allUsers.map((el) => {
      return {
        unit1_id: el?.unit1_id,
        unit1: el?.unit1,
        unit2_id: el?.unit2_id,
        unit2: el?.unit2,
      };
    });
    const subunits = uniqueElementsBy(
      units,
      (a, b) => a.unit2_id === b.unit2_id,
    ).filter((el) => !!el.unit2);
    // console.log(units, subunits);
    return uniqueElementsBy(units, (a, b) => a.unit1_id === b.unit1_id).map(
      (el) => {
        return {
          id: el.unit1_id,
          name: el.unit1,
          parent_id: 0,
          children: subunits
            .filter((item) => item.unit1_id === el.unit1_id)
            .map((r) => {
              return {
                id: r.unit2_id,
                name: r.unit2,
                parent_id: r.unit1_id,
                selected: false,
              };
            }),
          selected: false,
        } as Staff;
      },
    );
  }

  @Selector()
  public static getProjects(state: SubordinatesCostsStateModel): Project[] {
    const allDebtors = uniqueElementsBy(
      state.items.map((el) => el.debtor).filter(Boolean) as Debtor[],
      (a, b) => a?.id === b?.id,
    );

    if (allDebtors.length === 1) {
      return [
        {
          id: allDebtors[0]?.id ?? 0,
          name: allDebtors[0]?.name ?? '',
          selected: false,
        } as Project,
      ];
    }

    const items = new Set(
      allDebtors
        .map(({ id }) => id)
        .filter((id): id is number => !!id && id > 1000000),
    );

    return allDebtors
      .filter((el) => items.has(el?.id ?? 0))
      .map((el) => {
        return {
          id: el?.id ?? 0,
          name: el?.project_name ?? '',
          debtors: allDebtors
            .filter(
              (item) =>
                item?.project_id === el?.project_id &&
                (item?.id ?? 0) < 1000000,
            )
            .map((debtor) => ({
              ...debtor, // копия, не ссылка из state
              selected: false,
            })),
          selected: false,
        };
      });
  }

  @Selector()
  public static getCount(state: SubordinatesCostsStateModel) {
    return state.count;
  }

  @Action(FetchSubordinatesCosts, { cancelUncompleted: false })
  public fetchSubordinatesCosts(
    { patchState, getState }: StateContext<SubordinatesCostsStateModel>,
    { payload }: FetchSubordinatesCosts,
  ) {
    const state = getState();
    if (!state.loading) {
      patchState({ loading: true, filter: payload });
      this.costsService.getSubordinatesCosts(payload).pipe(
        tap(
          (result) => {
            patchState({ items: result, count: result.length });
          },
          (error) => {
            console.error(error.message);
          },
        ),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(SetSubordinatesFilter)
  public setSubordinatesFilter(
    { setState }: StateContext<SubordinatesCostsStateModel>,
    { payload }: SetSubordinatesFilter,
  ) {
    const safePayload = {
      ...payload,
      users: Array.from(payload.users ?? []),
      debtors: Array.from(payload.debtors ?? []),
      units: Array.from(payload.units ?? []),
    };
    setState(patch({ filter: safePayload }));
  }
}
