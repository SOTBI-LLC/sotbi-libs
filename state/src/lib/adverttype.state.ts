import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { SimpleEdit2Service, SimpleEdit2ServiceNames } from '@services/simple-edit2.service';
import { emptySimpleEdit2 } from '@sotbi/models';
import { catchError, tap, throwError } from 'rxjs';
import {
  AddEmptyItem,
  AddItem,
  DeleteItem,
  EditItem,
  FetchAdvertTypes,
} from './adverttype.actions';
import { SimpleEdit2StateModel } from './simple-edit.state.model';

@State<SimpleEdit2StateModel>({
  name: 'adverttypes',
  defaults: {
    items: [],
    selected: null,
    mapTItems: new Map(),
    mapFItems: new Map(),
  },
})
@Injectable()
export class AdvertTypesState implements NgxsOnInit {
  private readonly itemsService = inject(SimpleEdit2Service);

  @Selector()
  public static getMapsItem(state: SimpleEdit2StateModel) {
    return { tMap: state.mapTItems, fMap: state.mapFItems };
  }

  @Selector()
  public static getItems(state: SimpleEdit2StateModel) {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<SimpleEdit2StateModel>) {
    dispatch(new FetchAdvertTypes());
  }

  @Action(FetchAdvertTypes, { cancelUncompleted: true })
  public fetchItems({ getState, setState }: StateContext<SimpleEdit2StateModel>) {
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEdit2ServiceNames.ADVERT).pipe(
        tap((result) => {
          const filteredT = result.filter((el) => el.kind);
          const mapTItems = new Map(filteredT.map((i): [number, string] => [i.id, i.name]));
          const filteredF = result.filter((el) => !el.kind);
          const mapFItems = new Map(filteredF.map((i): [number, string] => [i.id, i.name]));
          setState({
            ...state,
            items: [...result, Object.assign({}, emptySimpleEdit2)],
            mapTItems,
            mapFItems,
          });
        }),
        catchError((error) => {
          console.error(error.message);
          return throwError(() => error);
        }),
      );
    }
  }

  @Action(AddItem)
  public addItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: AddItem,
  ) {
    const state = getState();
    return this.itemsService.create(payload, SimpleEdit2ServiceNames.ADVERT).pipe(
      tap((selected) => {
        const mapFItems = { ...state.mapFItems };
        const mapTItems = { ...state.mapTItems };
        if (selected.kind) {
          mapTItems.set(selected.id, selected.name);
        } else {
          mapFItems.set(selected.id, selected.name);
        }
        const items = state.items.filter(({ id }) => id != null);
        patchState({
          items: [...items, selected, Object.assign({}, emptySimpleEdit2)],
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

  @Action(AddEmptyItem)
  public addEmptyItem({ getState, patchState }: StateContext<SimpleEdit2StateModel>) {
    const state = getState();
    patchState({
      items: [...state.items, Object.assign({}, emptySimpleEdit2)],
    });
  }

  @Action(EditItem)
  public editItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: EditItem,
  ) {
    const state = getState();
    const { id } = payload;
    delete payload.id;
    return this.itemsService.save(id, payload, SimpleEdit2ServiceNames.ADVERT).pipe(
      tap((selected) => {
        const mapFItems = { ...state.mapFItems };
        const mapTItems = { ...state.mapTItems };
        if (selected.kind) {
          mapTItems.set(selected.id, selected.name);
        } else {
          mapFItems.set(selected.id, selected.name);
        }
        const items = state.items.map((el) => (el.id === selected.id ? selected : el));
        patchState({ items, mapTItems, mapFItems, selected });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: DeleteItem,
  ) {
    const state = getState();
    return this.itemsService.delete(payload, SimpleEdit2ServiceNames.ADVERT).pipe(
      tap(() => {
        const mapFItems = { ...state.mapFItems };
        const mapTItems = { ...state.mapTItems };
        mapFItems.delete(payload);
        mapTItems.delete(payload);
        patchState({
          items: state.items.filter(({ id }) => id !== payload),
          mapTItems,
          mapFItems,
          selected: null,
        });
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }
}
