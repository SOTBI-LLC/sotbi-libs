import { inject, Injectable } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import {
  SimpleEdit2Service,
  SimpleEdit2ServiceNames,
} from '@sotbi/data-access';
import type { SimpleEdit2Model } from '@sotbi/models';
import { emptySimpleEdit2 } from '@sotbi/models';
import { catchError, tap, throwError } from 'rxjs';
import { AddItem, DeleteItem, EditItem, FetchFlowTypes } from './flow.actions';
import type { SimpleEdit2StateModel } from './simple-edit.state.model';

@State<SimpleEdit2StateModel>({
  name: 'flow',
  defaults: {
    items: [],
    selected: null,
    mapTItems: new Map(),
    mapFItems: new Map(),
  },
})
// deprecated
@Injectable()
export class FlowState implements NgxsOnInit {
  private readonly itemsService = inject(SimpleEdit2Service);

  @Selector()
  public static getMapsItem(state: SimpleEdit2StateModel) {
    return { tMap: state.mapTItems, fMap: state.mapFItems };
  }

  @Selector()
  public static getFlowTypes(state: SimpleEdit2StateModel) {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<SimpleEdit2StateModel>) {
    dispatch(new FetchFlowTypes());
  }

  @Action(FetchFlowTypes, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEdit2StateModel>) {
    const state = getState();
    if (!state.items.length) {
      this.itemsService.getAll(SimpleEdit2ServiceNames.FLOW).pipe(
        tap((result) => {
          const filteredT = result.filter((el) => el.kind);
          const mapTItems = new Map(
            filteredT.map((i): [number, string] => [i.id, i.name]),
          );
          const filteredF = result.filter((el) => !el.kind);
          const mapFItems = new Map(
            filteredF.map((i): [number, string] => [i.id, i.name]),
          );
          setState({
            ...state,
            items: [...result, Object.assign({}, emptySimpleEdit2)],
            mapTItems,
            mapFItems,
          });
        }),
        catchError((err) => {
          console.error(err.message);
          return throwError(() => err);
        }),
      );
    }
  }

  @Action(AddItem)
  public addItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: AddItem,
  ) {
    const state = getState();
    return this.itemsService.create(payload, SimpleEdit2ServiceNames.FLOW).pipe(
      tap((selected: SimpleEdit2Model) => {
        const mapFItems = { ...state.mapFItems };
        const mapTItems = { ...state.mapTItems };
        if (selected.kind) {
          mapTItems.set(selected.id, selected.name);
        } else {
          mapFItems.set(selected.id, selected.name);
        }
        const items = state.items.filter(({ id }) => id != null);
        setState({
          ...state,
          items: [...items, selected, { ...emptySimpleEdit2 }],
          selected,
          mapTItems,
          mapFItems,
        });
      }),
      catchError((error) => {
        console.error(error);
        return throwError(() => error);
      }),
    );
  }

  @Action(EditItem)
  public editItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: EditItem,
  ) {
    const state = getState();
    return this.itemsService
      .save(payload.id, payload, SimpleEdit2ServiceNames.FLOW)
      .pipe(
        tap((selected) => {
          const mapFItems = { ...state.mapFItems };
          const mapTItems = { ...state.mapTItems };
          if (selected.kind) {
            mapTItems.set(selected.id, selected.name);
          } else {
            mapFItems.set(selected.id, selected.name);
          }
          const items = state.items.map((el) =>
            el.id === selected.id ? selected : el,
          );
          setState({ ...state, items, mapTItems, mapFItems, selected });
        }),
        catchError((error) => {
          console.error(error);
          return throwError(() => error);
        }),
      );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: DeleteItem,
  ) {
    const state = getState();
    return this.itemsService.delete(payload, SimpleEdit2ServiceNames.FLOW).pipe(
      tap(() => {
        const mapFItems = { ...state.mapFItems };
        const mapTItems = { ...state.mapTItems };
        mapFItems.delete(payload);
        mapTItems.delete(payload);
        setState({
          ...state,
          items: state.items.filter(({ id }) => id !== payload),
          mapTItems,
          mapFItems,
        });
      }),
      catchError((error) => {
        console.error(error);
        return throwError(() => error);
      }),
    );
  }
}
