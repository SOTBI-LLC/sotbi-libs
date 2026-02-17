import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SimpleEditService, SimpleEditServiceNames } from '@sotbi/data-access';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddPerson,
  DeletePerson,
  EditPerson,
  FetchPersons,
} from './persons.actions';
import type { SimpleEditStateModel } from './simple-edit.state.model';

@State<SimpleEditStateModel>({
  name: 'persons',
  defaults: {
    items: [],
    selected: null,
    mapItems: new Map(),
  },
})
@Injectable()
export class PersonsState {
  private readonly itemsService = inject(SimpleEditService);

  @Selector()
  public static getMapItem(state: SimpleEditStateModel) {
    return state.mapItems;
  }

  @Selector()
  public static getItems(state: SimpleEditStateModel) {
    return state.items;
  }

  @Action(FetchPersons, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEditStateModel>) {
    // console.log('PersonsState::fetchItems() | method called');
    const state = getState();
    if (!state.items.length) {
      this.itemsService.getAll(SimpleEditServiceNames.PERSON).pipe(
        tap({
          next: (result) => {
            const mapItems = new Map(
              result.map((i): [number, string] => [i.id, i.name]),
            );
            setState({
              ...state,
              items: [...state.items, ...result],
              mapItems,
            });
          },
          error: (error) => {
            console.error(error.message);
          },
        }),
        catchError((err) => {
          return throwError(() => err);
        }),
      );
    }
  }

  @Action(AddPerson)
  public addItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: AddPerson,
  ) {
    const state = getState();
    this.itemsService
      .create(payload.name ?? '', SimpleEditServiceNames.PERSON)
      .pipe(
        tap({
          next: (result) => {
            const mapItems = state.mapItems;
            mapItems.set(result.id, result.name);
            patchState({
              items: [...state.items, result],
              mapItems,
            });
          },
        }),
        catchError((error) => {
          console.error(error);
          return throwError(() => error);
        }),
      );
  }

  @Action(EditPerson)
  public editItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: EditPerson,
  ) {
    const state = getState();
    this.itemsService.save$(payload, SimpleEditServiceNames.PERSON).pipe(
      tap({
        next: (result) => {
          const mapItems = state.mapItems;
          mapItems.set(result.id, result.name);
          const items = [...state.items];
          const idx = items.findIndex((el) => el.id === result.id);
          items[idx] = result;
          patchState({ items, mapItems });
        },
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  @Action(DeletePerson)
  public deleteItem(
    { getState, patchState }: StateContext<SimpleEditStateModel>,
    { payload }: DeletePerson,
  ) {
    const state = getState();
    this.itemsService.delete(payload, SimpleEditServiceNames.PERSON).pipe(
      tap({
        next: () => {
          const mapItems = state.mapItems;
          mapItems.delete(payload);
          patchState({
            items: state.items.filter(({ id }) => id !== payload),
            mapItems,
          });
        },
      }),
      catchError((error) => {
        console.error(error);
        return throwError(() => error);
      }),
    );
  }
}
