import { Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import type { PerformanceCriteria } from '@sotbi/models';
import { PerformanceCriteriaAction } from './performance-criteria.actions';

export interface PerformanceCriteriaStateModel {
  items: PerformanceCriteria[];
  loading: boolean;
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
  @Selector()
  public static getState(state: PerformanceCriteriaStateModel) {
    return state;
  }

  @Action(PerformanceCriteriaAction)
  public add(
    { getState, setState }: StateContext<PerformanceCriteriaStateModel>,
    { payload }: PerformanceCriteriaAction,
  ) {
    const stateModel = getState();
    stateModel.items = [...stateModel.items, payload];
    setState(stateModel);
  }
}
