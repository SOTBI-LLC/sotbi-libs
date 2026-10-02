import type { AfterViewInit} from '@angular/core';
import { Component, DestroyRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CheckNumEditorParams extends ICellEditorParams {
  lookupNumber: (num: string) => Observable<unknown>;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- селектор сохранён для совместимости
  selector: 'app-check-num-editor-cell',
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
  private readonly destroyRef = inject(DestroyRef);
  private lookupNumber!: CheckNumEditorParams['lookupNumber'];

  private readonly textInput = viewChild<{
    nativeElement: {
      focus: () => void;
    };
  }>('input');
  protected value!: string;

  public agInit(params: CheckNumEditorParams): void {
    this.value = params.value;
    this.lookupNumber = params.lookupNumber;
  }

  public getValue(): string {
    return this.value;
  }

  protected change(): void {
    if (this.value !== '') {
      this.lookupNumber(this.value)
        .pipe(
          map(() => {
            return (this.value = ' ' + this.value);
          }),
          catchError((err) => {
            console.error(err);
            this.value = this.value.trim();
            return EMPTY;
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    }
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.textInput()?.nativeElement.focus();
    });
  }
}
