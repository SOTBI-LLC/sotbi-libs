import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DadataService } from '@root/service/dadata.service';
import { Dadata } from '@sotbi/models';
import { tap } from 'rxjs/operators';
import { GetDadataInformationByInn } from './dadata.actions';

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
        const neededValue = value.find((item) => item.data?.kpp?.startsWith(firstLetters));
        patchState({ selectedObject: neededValue || value[0] });
      }),
    );
  }
}
