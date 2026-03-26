import { inject, Injectable } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { StaffTypeService } from '@sotbi/data-access';
import type { itemMap, SimpleEdit2Model } from '@sotbi/models';
import { emptySimpleEdit2 } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { SimpleEdit2StateModel } from './simple-edit.state.model';
import {
  AddStaffItem,
  DeleteStaffItem,
  EditStaffItem,
  FetchStaffTypes,
  GetStaffType,
} from './staff-type.actions';

@State<SimpleEdit2StateModel>({
  name: 'stafftype',
  defaults: {
    items: [],
    selected: null,
    mapTItems: new Map(),
    mapFItems: new Map(),
  },
})
@Injectable()
export class StaffTypeState implements NgxsOnInit {
  private readonly staffTypeService = inject(StaffTypeService);

  @Selector()
  public static getMapItems(state: SimpleEdit2StateModel) {
    return { tMap: state.mapTItems, fMap: state.mapFItems };
  }

  @Selector()
  public static getFalseMapItems(state: SimpleEdit2StateModel): itemMap {
    return state.mapFItems;
  }

  @Selector()
  public static getStaffTypes(state: SimpleEdit2StateModel) {
    return state.items;
  }

  @Selector()
  public static getItem(state: SimpleEdit2StateModel) {
    return state.selected;
  }

  public ngxsOnInit({ dispatch }: StateContext<SimpleEdit2StateModel>) {
    dispatch(new FetchStaffTypes());
  }

  @Action(FetchStaffTypes, { cancelUncompleted: true })
  public fetchItems({
    getState,
    setState,
  }: StateContext<SimpleEdit2StateModel>) {
    // console.log('StaffTypeState::FetchStaffTypes');
    const state = getState();
    if (!state.items.length) {
      return this.staffTypeService.getAll().pipe(
        tap((items) => {
          const filteredT = items.filter((el) => el.kind);
          const mapTItems = new Map(
            filteredT.map((i): [number, string] => [i.id, i.name]),
          );
          const filteredF = items.filter((el) => !el.kind);
          const mapFItems = new Map(
            filteredF.map((i): [number, string] => [i.id, i.name]),
          );
          setState({
            ...state,
            items: [...items, Object.assign({}, emptySimpleEdit2)],
            selected: null,
            mapTItems,
            mapFItems,
          });
        }),
        catchError((err) => throwError(err)),
      );
    }
    return of([]);
  }

  @Action(AddStaffItem)
  public addItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: AddStaffItem,
  ) {
    // console.log('StaffTypeState::AddStaffItem', payload);
    return this.staffTypeService.create(payload).pipe(
      tap((item) => {
        const state = getState();
        const items = state.items.filter(({ id }) => id != null);
        if (item.kind) {
          state.mapTItems.set(item.id, item.name);
        } else {
          state.mapFItems.set(item.id, item.name);
        }
        patchState({
          items: [...items, item, Object.assign({}, emptySimpleEdit2)],
          selected: item,
          mapTItems: state.mapTItems,
          mapFItems: state.mapFItems,
        });
      }),
      catchError((err) => throwError(err)),
    );
  }

  @Action(EditStaffItem)
  public editItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: EditStaffItem,
  ) {
    // console.log('StaffTypeState::EditStaffItem', payload);
    return this.staffTypeService.update(payload).pipe(
      tap((item) => {
        const state = getState();
        const idx = state.items.findIndex(({ id }) => id === payload.id);
        state.items[idx] = item;
        if (item.kind) {
          state.mapTItems.set(item.id, item.name);
        } else {
          state.mapFItems.set(item.id, item.name);
        }
        patchState({
          items: state.items,
          selected: item,
          mapTItems: state.mapTItems,
          mapFItems: state.mapFItems,
        });
      }),
      catchError((err) => throwError(err)),
    );
  }

  @Action(DeleteStaffItem)
  public deleteItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: DeleteStaffItem,
  ) {
    // console.log('StaffTypeState::DeleteStaffItem', payload);
    return this.staffTypeService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const mapFItems = state.mapFItems;
        const mapTItems = state.mapTItems;
        mapFItems.delete(payload);
        mapTItems.delete(payload);
        patchState({
          items: state.items.filter(({ id }) => id !== payload),
          selected: null,
          mapTItems,
          mapFItems,
        });
      }),
      catchError((err) => throwError(err)),
    );
  }

  @Action(GetStaffType, { cancelUncompleted: true })
  public getItem(
    { getState, patchState }: StateContext<SimpleEdit2StateModel>,
    { payload }: GetStaffType,
  ) {
    // console.log('StaffTypeState::GetStaffType', payload);
    let selected: SimpleEdit2Model | undefined;
    if (payload === 0) {
      selected = { id: 0, name: '', kind: false };
      return patchState({ selected });
    }
    const state = getState();
    if (state.items.length > 0) {
      selected = state.items.find(({ id }) => id === payload);
      return patchState({ selected });
    } else {
      return this.staffTypeService.get(payload).pipe(
        tap((item) => {
          patchState({ selected: item });
        }),
        catchError((err) => throwError(err)),
      );
    }
  }
}
