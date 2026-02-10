import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { ArbitrationService } from '@sotbi/data-access';
import type { Arbitration } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddArbitration,
  DeleteArbitration,
  EditArbitration,
  FetchArbitrations,
  GetArbitration,
} from './arbitrations.actions';

export class ArbitrationStateModel {
  public items: Arbitration[] = [];
  public mapItems: Map<string, string> = new Map();
  public selected: Arbitration | null = null;
}

// TODO: write test for this state
@State<ArbitrationStateModel>({
  name: 'arbitrs',
  defaults: {
    items: [],
    mapItems: new Map(),
    selected: null,
  },
})
@Injectable()
export class ArbitrationState implements NgxsOnInit {
  private readonly arbitrationSrv = inject(ArbitrationService);

  @Selector()
  public static getItems(state: ArbitrationStateModel) {
    return state.items;
  }

  @Selector()
  public static getItem(state: ArbitrationStateModel) {
    return state.selected;
  }

  @Selector()
  public static getMap(state: ArbitrationStateModel) {
    return state.mapItems;
  }

  public ngxsOnInit({ dispatch }: StateContext<ArbitrationStateModel>) {
    dispatch(new FetchArbitrations());
  }

  @Action(FetchArbitrations, { cancelUncompleted: true })
  public fetchArbitrations({
    getState,
    setState,
  }: StateContext<ArbitrationStateModel>) {
    const state = getState();
    if (!state.items.length) {
      return this.arbitrationSrv.GetAll().pipe(
        tap((result) => {
          const mapArbitrations = new Map(
            result.map((i): [string, string] => [i.id, i.name]),
          );
          setState({
            ...state,
            items: result,
            mapItems: mapArbitrations,
          });
        }),
        catchError((err) => throwError(err)),
      );
    }
    return undefined;
  }

  @Action(GetArbitration)
  public getArbitration(
    { setState, getState }: StateContext<ArbitrationStateModel>,
    { payload }: GetArbitration,
  ) {
    return this.arbitrationSrv.get(payload).pipe(
      tap((selected) => {
        const state = getState();
        setState({ ...state, selected });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(AddArbitration)
  public addArbitration(
    { getState, setState }: StateContext<ArbitrationStateModel>,
    { payload }: AddArbitration,
  ) {
    return this.arbitrationSrv.add({ name: payload }).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [result, ...state.items],
        });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(EditArbitration)
  public editArbitration(
    { getState, setState }: StateContext<ArbitrationStateModel>,
    { payload }: EditArbitration,
  ) {
    return this.arbitrationSrv.update(payload).pipe(
      tap((selected: Arbitration) => {
        const state = getState();
        setState({
          ...state,
          items: state.items.map((el) =>
            el.id === selected.id ? selected : el,
          ),
          selected,
        });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(DeleteArbitration)
  public deleteArbitration(
    { getState, setState }: StateContext<ArbitrationStateModel>,
    { payload }: DeleteArbitration,
  ) {
    return this.arbitrationSrv.delete(payload).pipe(
      tap(() => {
        const state = getState();
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
        });
      }),
      catchError((err) => throwError(err)),
    );
  }
}
