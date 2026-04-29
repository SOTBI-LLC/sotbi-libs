import { Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import type { BaseCriteria } from '@sotbi/models';
import { BaseCriteriaAction } from './base-criteria.actions';

export interface BaseCriteriaStateModel {
  items: BaseCriteria[];
  loading: boolean;
}

@State<BaseCriteriaStateModel>({
  name: 'baseCriteria',
  defaults: {
    items: [],
    loading: false,
  },
})
@Injectable()
export class BaseCriteriaState {
  @Selector()
  public static getState(state: BaseCriteriaStateModel) {
    return state;
  }

  @Action(BaseCriteriaAction)
  public add(
    { getState, setState }: StateContext<BaseCriteriaStateModel>,
    { payload }: BaseCriteriaAction,
  ) {
    const stateModel = getState();
    stateModel.items = [...stateModel.items, payload];
    setState(stateModel);
  }
}
