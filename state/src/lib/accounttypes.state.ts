import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { forMap } from '@root/shared/rx-filtres';
import { SimpleEditService, SimpleEditServiceNames } from '@services/simple-edit.service';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AddItem, DeleteItem, EditItem, FetchAccountTypes } from './accounttypes.actions';
import { SimpleEditStateModel } from './simple-edit.state.model';

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
  public fetchItems({ getState, setState }: StateContext<SimpleEditStateModel>) {
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
  }

  @Action(AddItem)
  public addItem({ getState, patchState }: StateContext<SimpleEditStateModel>, { payload }) {
    const state = getState();
    return this.itemsService.create(payload, SimpleEditServiceNames.ACCOUNTTYPE).pipe(
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

  @Action(EditItem)
  public editItem({ getState, patchState }: StateContext<SimpleEditStateModel>, { payload }) {
    const state = getState();
    return this.itemsService.save$(payload, SimpleEditServiceNames.ACCOUNTTYPE).pipe(
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

  @Action(DeleteItem)
  public deleteItem({ getState, patchState }: StateContext<SimpleEditStateModel>, { payload }) {
    const state = getState();
    return this.itemsService.delete(payload, SimpleEditServiceNames.ACCOUNTTYPE).pipe(
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
