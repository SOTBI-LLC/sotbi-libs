import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import { forMap } from '@sotbi/utils';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddAccountType,
  DeleteAccountType,
  EditAccountType,
  FetchAccountTypes,
} from './accounttypes.actions';
import type { SimpleEditStateModel } from './simple-edit.state.model';

@State<SimpleEditStateModel>({
  name: 'accounttypes',
  defaults: {
    items: [],
    selected: null,
    mapItems: new Map(),
  },
})
@Injectable()
export class AccountTypesState implements NgxsOnInit {
  private readonly itemsService = inject(SimpleEditService);

  @Selector()
  public static getMapItems(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  @Selector()
  public static getItems(state: SimpleEditStateModel) {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<SimpleEditStateModel>) {
    dispatch(new FetchAccountTypes());
  }

  @Action(FetchAccountTypes, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEditStateModel>) {
    // console.log('AccountTypesState::FetchAccountTypes() | method called');
    const state = getState();
    if (!state.items.length) {
      return this.itemsService.getAll(SimpleEditServiceNames.ACCOUNTTYPE).pipe(
        tap(
          (result) => {
            const mapItems = new Map(result.map(forMap));
            setState({
              ...state,
              items: result,
              mapItems,
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
    return of();
  }

  @Action(AddAccountType)
  public addItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: AddAccountType,
  ) {
    const state = getState();
    return this.itemsService
      .create(payload, SimpleEditServiceNames.ACCOUNTTYPE)
      .pipe(
        tap((result) => {
          const mapItems = state.mapItems;
          mapItems.set(result.id, result.name);
          patchState({
            items: [...state.items, result],
            mapItems,
          });
        }),
        catchError((error) => {
          console.error(error);
          return throwError(() => error);
        }),
      );
  }

  @Action(EditAccountType)
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditAccountType,
  ) {
    const state = getState();
    return this.itemsService
      .save$(payload, SimpleEditServiceNames.ACCOUNTTYPE)
      .pipe(
        tap(
          (result) => {
            const mapItems = state.mapItems;
            mapItems.set(result.id, result.name);
            const items = state.items;
            const idx = items.findIndex((el) => el.id === result.id);
            items[idx] = result;
            patchState({ items, mapItems });
          },
          catchError((err) => {
            return throwError(err);
          }),
        ),
      );
  }

  @Action(DeleteAccountType)
  public deleteItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: DeleteAccountType,
  ) {
    const state = getState();
    return this.itemsService
      .delete(payload, SimpleEditServiceNames.ACCOUNTTYPE)
      .pipe(
        tap(() => {
          const mapItems = state.mapItems;
          mapItems.delete(payload);
          patchState({
            items: state.items.filter(({ id }) => id !== payload),
            mapItems,
          });
        }),
        catchError((error) => {
          console.error(error);
          return throwError(() => error);
        }),
      );
  }
}
