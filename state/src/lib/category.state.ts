import { inject, Injectable } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import {
  SimpleEdit2Service,
  SimpleEdit2ServiceNames,
} from '@sotbi/data-access';
import type { SimpleEdit2Model } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import { catchError, tap, throwError } from 'rxjs';
import {
  AddCategory,
  DeleteCategory,
  EditCategory,
  FetchCategories,
} from './category.actions';
import type { itemMap, SimpleEdit2StateModel } from './simple-edit.state.model';

@State<SimpleEdit2StateModel>({
  name: 'category',
  defaults: {
    items: [],
    selected: null,
    mapTItems: new Map(),
    mapFItems: new Map(),
  },
})
@Injectable()
export class CategoryState implements NgxsOnInit {
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
    dispatch(new FetchCategories());
  }

  @Action(FetchCategories, { cancelUncompleted: true })
  public fetchItems({
    getState,
    patchState,
  }: StateContext<SimpleEdit2StateModel>) {
    // console.log('CategoryState::fetchItems() -> method called');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEdit2ServiceNames.CATEGORY).pipe(
        tap((result) => {
          const filteredT = result.filter((el) => el.kind);
          const mapTItems = new Map(
            filteredT.map((i): [number, string] => [i.id, i.name]),
          );
          const filteredF = result.filter((el) => !el.kind);
          const mapFItems = new Map(
            filteredF.map((i): [number, string] => [i.id, i.name]),
          );
          return patchState({
            items: result,
            mapTItems,
            mapFItems,
          });
        }),
        catchError((err) => {
          console.error(err.message);
          return throwError(err);
        }),
      );
    }
    return;
  }

  @Action(AddCategory)
  public addItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: AddCategory,
  ) {
    const state = getState();
    return this.itemsService
      .create(payload, SimpleEdit2ServiceNames.CATEGORY)
      .pipe(
        tap((selected) => {
          const mapFItems = { ...state.mapFItems };
          const mapTItems = { ...state.mapTItems };
          if (selected.kind) {
            mapTItems.set(selected.id, selected.name);
          } else {
            mapFItems.set(selected.id, selected.name);
          }
          setState({
            ...state,
            items: [...state.items, selected],
            selected,
            mapTItems,
            mapFItems,
          });
        }),
        catchError((err) => {
          console.error(err.message);
          return throwError(err);
        }),
      );
  }

  @Action(EditCategory)
  public editItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: EditCategory,
  ) {
    const state = getState();
    const { id } = payload;
    return this.itemsService
      .save(
        id,
        removeID(payload) as SimpleEdit2Model,
        SimpleEdit2ServiceNames.CATEGORY,
      )
      .pipe(
        tap((selected) => {
          const mapFItems = state.mapFItems;
          const mapTItems = state.mapTItems;
          if (selected.kind) {
            mapTItems.set(selected.id, selected.name);
          } else {
            mapFItems.set(selected.id, selected.name);
          }
          const items = state.items.map((el) =>
            el.id === selected.id ? selected : el,
          );
          patchState({ items, mapTItems, mapFItems, selected });
        }),
        catchError((err) => {
          console.error(err.message);
          return throwError(() => err);
        }),
      );
  }

  @Action(DeleteCategory)
  public deleteItem(
    { getState, setState }: StateContext<SimpleEdit2StateModel>,
    { payload }: DeleteCategory,
  ) {
    const state = getState();
    return this.itemsService
      .delete(payload, SimpleEdit2ServiceNames.CATEGORY)
      .pipe(
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
        catchError((err) => {
          console.error(err.message);
          return throwError(() => err);
        }),
      );
  }
}
