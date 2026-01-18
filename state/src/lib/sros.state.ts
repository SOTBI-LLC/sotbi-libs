import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { forMap } from '@root/shared/rx-filtres';
import { SroService } from '@services/sro.service';
import { Sro } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { itemMap } from './simple-edit.state.model';
import { AddSro, DeleteSro, EditSro, FetchSros, GetSro } from './sros.actions';

export class SroStateModel {
  public items: Sro[];
  public mapSros: itemMap;
  public selectedSro: Sro;
}

@State<SroStateModel>({
  name: 'sros',
  defaults: {
    items: [],
    mapSros: new Map(),
    selectedSro: null,
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
  public fetchSros({ getState, setState }: StateContext<SroStateModel>) {
    // console.log('SrosState::FetchSros');
    const state = getState();
    if (!state.items.length) {
      return this.sroSrv.getAll().pipe(
        catchError((err) => {
          return throwError(err);
        }),
        tap(
          (result) => {
            const mapSros = new Map(result.map(forMap));
            setState({
              ...state,
              items: result,
              mapSros,
            });
          },
          (error) => {
            console.error(error.message);
          },
        ),
      );
    }
  }

  @Action(GetSro)
  public async getSro({ patchState, getState }: StateContext<SroStateModel>, { payload }) {
    const state = getState();
    let result: Sro;
    const items = state.items;
    const idx = items.findIndex(({ id }) => payload === id);
    if (!items[idx].full_name) {
      result = await this.sroSrv.get(payload);
      items[idx] = result;
    } else {
      result = state.items[idx];
    }
    patchState({ items, selectedSro: result });
  }

  @Action(AddSro)
  public addSro({ getState, patchState }: StateContext<SroStateModel>, { payload }) {
    return this.sroSrv.create(payload).pipe(
      tap((result) => {
        const state = getState();
        const mapSros = state.mapSros;
        mapSros.set(result.id, result.name);
        patchState({ items: [result, ...state.items], mapSros });
      }),
      catchError((err) => throwError(err)),
    );
  }

  @Action(EditSro)
  public editSro({ getState, patchState }: StateContext<SroStateModel>, { payload }) {
    const { id } = payload;
    delete payload.id;
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
      catchError((err) => throwError(err)),
    );
  }

  @Action(DeleteSro)
  public deleteSro({ getState, setState }: StateContext<SroStateModel>, { payload }) {
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
