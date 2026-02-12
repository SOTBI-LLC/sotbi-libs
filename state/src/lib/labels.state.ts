import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { LabelService } from '@sotbi/data-access';
import type { Label } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddLabel,
  DeleteLabel,
  EditLabel,
  FetchLabels,
  GetLabel,
} from './labels.actions';
import type { itemMap } from './simple-edit.state.model';

export class LabelStateModel {
  public items: Label[] = [];
  public map: itemMap = new Map();
  public selected: Label | null = null;
}

@State<LabelStateModel>({
  name: 'labels',
  defaults: {
    items: [],
    map: new Map(),
    selected: null,
  },
})
@Injectable()
export class LabelsState implements NgxsOnInit {
  private readonly service = inject(LabelService);

  @Selector()
  public static getLabel(state: LabelStateModel) {
    return state.selected;
  }
  @Selector()
  public static getState(state: LabelStateModel) {
    return state;
  }
  @Selector()
  public static getItems(state: LabelStateModel) {
    return state.items;
  }
  @Selector()
  public static getMap(state: LabelStateModel) {
    return state.map;
  }

  public ngxsOnInit({ dispatch }: StateContext<LabelStateModel>) {
    dispatch(new FetchLabels());
  }

  @Action(FetchLabels, { cancelUncompleted: true })
  public fetchItems({ getState, setState }: StateContext<LabelStateModel>) {
    // console.log('LabelsState::FetchLabels');
    const state = getState();
    if (!state.items.length) {
      this.service.getAll().pipe(
        catchError((err) => {
          return throwError(() => err);
        }),
        tap({
          next: (items) => {
            const map = new Map(
              items.map((i): [number, string] => [i.id, i.name]),
            );
            setState({
              ...state,
              items,
              map,
            });
          },
          error: (error) => {
            console.error(error.message);
          },
        }),
      );
    }
  }

  @Action(GetLabel)
  public getItem(
    { patchState, getState }: StateContext<LabelStateModel>,
    { payload }: GetLabel,
  ) {
    const state = getState();
    const items = [...state.items];
    const idx = items.findIndex(({ id }) => payload === id);
    if (!items[idx].name) {
      this.service.get(payload).subscribe((selected: Label) => {
        items[idx] = selected;
        patchState({ items, selected });
      });
    } else {
      patchState({ items, selected: state.items[idx] });
    }
  }

  @Action(AddLabel)
  public addItem(
    { getState, patchState }: StateContext<LabelStateModel>,
    { payload }: AddLabel,
  ) {
    return this.service.create(payload).pipe(
      tap((result) => {
        const state = getState();
        const map = state.map;
        map.set(result.id, result.name);
        patchState({ items: [result, ...state.items], map });
      }),
      catchError((err) => throwError(err)),
    );
  }

  @Action(EditLabel)
  public editItem(
    { getState, patchState }: StateContext<LabelStateModel>,
    { payload }: EditLabel,
  ) {
    const { id } = payload;
    this.service.update(id, payload).pipe(
      tap((selected: Label) => {
        const state = getState();
        const map = state.map;
        map.set(id, selected.name);
        const items = state.items;
        const idx = items.findIndex((el) => el.id === id);
        items[idx] = selected;
        patchState({ items, map, selected });
      }),
      catchError((err) => throwError(err)),
    );
  }

  @Action(DeleteLabel)
  public deleteItem(
    { getState, setState }: StateContext<LabelStateModel>,
    { payload }: DeleteLabel,
  ) {
    return this.service.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const map = state.map;
        map.delete(payload);
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
          map,
        });
      }),
      catchError((err) => throwError(err)),
    );
  }
}
