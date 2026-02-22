import { Injectable, inject } from '@angular/core';
import type { NgxsOnInit, StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { SroService } from '@sotbi/data-access';
import type { Sro } from '@sotbi/models';
import { forMap } from '@sotbi/utils';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import type { itemMap } from './simple-edit.state.model';
import { AddSro, DeleteSro, EditSro, FetchSros, GetSro } from './sros.actions';

export class SroStateModel {
  public items: Sro[] = [];
  public mapSros: itemMap = new Map();
  public selectedSro: Sro | null | undefined = null;
  public loading = false;
}

@State<SroStateModel>({
  name: 'sros',
  defaults: {
    items: [],
    mapSros: new Map(),
    selectedSro: null,
    loading: false,
  },
})
@Injectable()
export class SrosState implements NgxsOnInit {
  private readonly sroSrv = inject(SroService);

  @Selector()
  public static getSros(state: SroStateModel) {
    return state.items;
  }
  @Selector()
  public static getSro(state: SroStateModel) {
    return state.selectedSro;
  }
  @Selector()
  public static getMapSros(state: SroStateModel) {
    return state.mapSros;
  }

  public ngxsOnInit({ dispatch }: StateContext<SroStateModel>) {
    dispatch(new FetchSros());
  }

  @Action(FetchSros, { cancelUncompleted: true })
  public fetchSros({
    getState,
    setState,
    patchState,
  }: StateContext<SroStateModel>) {
    // console.log('SrosState::FetchSros');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.sroSrv.getAll().pipe(
        catchError((err) => {
          return throwError(() => err);
        }),
        finalize(() => patchState({ loading: false })),
        tap({
          next: (items: Sro[]) => {
            const mapSros = new Map(items.map(forMap));
            setState({
              ...state,
              items,
              mapSros,
            });
          },
        }),
      );
    }
    return of();
  }

  @Action(GetSro)
  public getSro(
    { patchState, getState }: StateContext<SroStateModel>,
    { payload }: GetSro,
  ) {
    patchState({ loading: true });
    const state = getState();
    let result: Sro;
    const items = structuredClone(state.items);
    const idx = items.findIndex(({ id }) => payload === id);
    if (!items[idx].full_name) {
      this.sroSrv.get(payload).subscribe((result) => {
        items[idx] = result;
        patchState({ items, selectedSro: result, loading: false });
      });
    } else {
      result = state.items[idx];
      patchState({ items, selectedSro: result, loading: false });
    }
  }

  @Action(AddSro)
  public addSro(
    { getState, patchState }: StateContext<SroStateModel>,
    { payload }: AddSro,
  ) {
    return this.sroSrv.create(payload).pipe(
      tap((result) => {
        const state = getState();
        const mapSros = state.mapSros;
        mapSros.set(result.id, result.name);
        patchState({ items: [result, ...state.items], mapSros });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(EditSro)
  public editSro(
    { getState, patchState }: StateContext<SroStateModel>,
    { payload }: EditSro,
  ) {
    const { id } = payload;
    return this.sroSrv.save(payload, id).pipe(
      tap((result: Sro) => {
        const state = getState();
        const mapSros = state.mapSros;
        mapSros.set(id, result.name);
        const items = state.items;
        const idx = items.findIndex((el) => el.id === id);
        items[idx] = result;
        patchState({ items, mapSros, selectedSro: result });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(DeleteSro)
  public deleteSro(
    { getState, setState }: StateContext<SroStateModel>,
    { payload }: DeleteSro,
  ) {
    return this.sroSrv.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const mapSros = state.mapSros;
        mapSros.delete(payload);
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
          mapSros,
          selectedSro: null,
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }
}
