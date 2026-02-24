import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { DadataService } from '@sotbi/data-access';
import type { Dadata } from '@sotbi/models';
import { tap, catchError } from 'rxjs/operators';
import { GetDadataInformationByInn } from './dadata.actions';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export class DadataStateModel {
  public selectedObject: null | Dadata = null;
}

@State<DadataStateModel>({
  name: 'dadata',
  defaults: {
    selectedObject: null,
  },
})
@Injectable()
export class DadataState {
  private readonly itemsService = inject(DadataService);
  private readonly snackBar = inject(MatSnackBar);

  @Selector()
  public static getSelectedObject(state: DadataStateModel) {
    return state.selectedObject;
  }
  @Action(GetDadataInformationByInn)
  public getDadataInformationByInn(
    { patchState }: StateContext<DadataStateModel>,
    { inn }: GetDadataInformationByInn,
  ) {
    return this.itemsService.getDataByInn(inn).pipe(
      tap((value) => {
        const firstLetters = inn.toString().substring(0, 2);
        const neededValue = value.find((item) =>
          item.data?.kpp?.startsWith(firstLetters),
        );
        patchState({ selectedObject: neededValue || value[0] });
        if (value.length === 0) {
          this.snackBar.open(`По ИНН ${inn} не найдено данных`, '', {
            duration: 4000,
          });
        }
      }),
      catchError((err) => {
        this.snackBar.open(
          `${err.error || 'Произошла ошибка при запросе'}`,
          '',
          {
            duration: 4000,
          },
        );
        patchState({ selectedObject: null });
        return of(null);
      }),
    );
  }
}
