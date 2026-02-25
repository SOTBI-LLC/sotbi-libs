import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { DadataService } from '@sotbi/data-access';
import type { Dadata } from '@sotbi/models';
import { tap, catchError } from 'rxjs/operators';
import { GetDadataInformationByInn } from './dadata.actions';
import { of } from 'rxjs';
import { AUTH_NOTIFICATION } from '@sotbi/auth';

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
  private readonly notification = inject(AUTH_NOTIFICATION, { optional: true });

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
        if (value?.length === 0) {
          this.notification?.showError(`По ИНН ${inn} не найдено данных`);
        }
      }),
      catchError((err) => {
        this.notification?.showError(
          err?.error || 'Произошла ошибка при запросе',
        );
        patchState({ selectedObject: null });
        return of(null);
      }),
    );
  }
}
