import { Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import type { UserPerformance } from '@sotbi/models';
import { UserPerformanceAction } from './user-performance.actions';

export interface UserPerformanceStateModel {
  items: UserPerformance[];
}

@State<UserPerformanceStateModel>({
  name: 'userPerformance',
  defaults: {
    items: [],
  },
})
@Injectable()
export class UserPerformanceState {
  @Selector()
  public static getState(state: UserPerformanceStateModel) {
    return state;
  }

  @Action(UserPerformanceAction)
  public add(
    { getState, setState }: StateContext<UserPerformanceStateModel>,
    { payload }: UserPerformanceAction,
  ) {
    const stateModel = getState();
    stateModel.items = [...stateModel.items, payload];
    setState(stateModel);
  }
}
