import type { AfterViewInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EgrnRequestService } from '@services/egrn-request.service';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';
import { catchError, map } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      id="checkNum"
      name="checkNum"
      #checkNum="ngModel"
      #input
      [(ngModel)]="value"
      class="ag-input-field-input ag-text-field-input"
      (ngModelChange)="change()"
    />
  `,
  imports: [FormsModule],
})
export class CheckNumEditor implements AfterViewInit, ICellEditorAngularComp {
  private readonly egrnReqSrv = inject(EgrnRequestService);

  private readonly textInput = viewChild<{
    nativeElement: {
      focus: () => void;
    };
  }>('input');

  protected value = '';

  public agInit(params: ICellEditorParams): void {
    this.value = params.value;
  }

  public getValue() {
    return this.value;
  }

  protected change() {
    if (this.value !== '') {
      this.egrnReqSrv
        .getNum(this.value)
        .pipe(
          map(() => {
            return (this.value = ' ' + this.value);
          }),
          catchError((err) => {
            console.error(err);
            return (this.value = this.value.trim());
          })
        )
        .subscribe();
    }
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.textInput()?.nativeElement.focus();
    });
  }
}
