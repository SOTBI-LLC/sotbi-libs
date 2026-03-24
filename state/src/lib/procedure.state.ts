import { inject, Injectable } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import {
  SimpleEdit2Service,
  SimpleEdit2ServiceNames,
} from '@sotbi/data-access';
import type { itemMap } from '@sotbi/models';
import { emptySimpleEdit2 } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddProcedure,
  DeleteProcedure,
  EditProcedure,
  FetchProcedures,
} from './procedure.actions';
import type { SimpleEdit2StateModel } from './simple-edit.state.model';

@State<SimpleEdit2StateModel>({
  name: 'procedure',
  defaults: {
    items: [],
    selected: null,
    mapTItems: new Map(),
    mapFItems: new Map(),
  },
})
@Injectable()
export class ProcedureState implements NgxsOnInit {
  private readonly itemsService = inject(SimpleEdit2Service);

  @Selector()
  public static getMapsItem(state: SimpleEdit2StateModel) {
    return { tMap: state.mapTItems, fMap: state.mapFItems };
  }

  @Selector()
  public static getTrueMap(state: SimpleEdit2StateModel): itemMap {
    return state.mapTItems;
  }

  @Selector()
  public static getFalseMap(state: SimpleEdit2StateModel): itemMap {
    return state.mapFItems;
  }

  @Selector()
  public static getItems(state: SimpleEdit2StateModel) {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<SimpleEdit2StateModel>) {
    dispatch(new FetchProcedures());
  }

  @Action(FetchProcedures, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEdit2StateModel>) {
    // console.log('ProcedureState::FetchProcedures() | method called');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEdit2ServiceNames.PROCEDURE).pipe(
        tap(
          (result) => {
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
          },
          (error) => {
            console.error(error.message);
          },
        ),
        catchError((err) => {
          return throwError(err);
        }),
      );
    }
    return of(state.items);
  }

  @Action(AddProcedure)
  public addItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: AddProcedure,
  ) {
    const state = getState();
    return this.itemsService
      .create(payload, SimpleEdit2ServiceNames.PROCEDURE)
      .pipe(
        tap((result) => {
          const mapFItems = { ...state.mapFItems };
          const mapTItems = { ...state.mapTItems };
          if (result.kind) {
            mapTItems.set(result.id, result.name);
          } else {
            mapFItems.set(result.id, result.name);
          }
          const items = state.items.filter(({ id }) => id != null);
          const selected = { ...emptySimpleEdit2 };
          setState({
            ...state,
            items: [...items, result, selected],
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

  @Action(EditProcedure)
  public editItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: EditProcedure,
  ) {
    const state = getState();
    const { id } = payload;
    return this.itemsService
      .save(id, payload, SimpleEdit2ServiceNames.PROCEDURE)
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

  @Action(DeleteProcedure)
  public deleteItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: DeleteProcedure,
  ) {
    const state = getState();
    return this.itemsService
      .delete(payload, SimpleEdit2ServiceNames.PROCEDURE)
      .pipe(
        tap(() => {
          const mapFItems = { ...state.mapFItems };
          const mapTItems = { ...state.mapTItems };
          mapFItems.delete(payload);
          mapTItems.delete(payload);
          setState({
            ...state,
            items: state.items.filter(({ id }) => id !== payload),
            selected: null,
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
