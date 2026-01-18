import { AfterViewInit, Component, ViewContainerRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { IMaskDirective } from 'angular-imask';
import { maskForSumm } from '../shared-globals';

@Component({
  selector: 'numeric-cell',
  template: `
    <input
      #input
      type="text"
      [imask]="{ mask: mask }"
      [unmask]="unmask"
      minlength="{{ minlength }}"
      maxlength="{{ maxlength }}"
      [(ngModel)]="value"
      style="width: 100%; height: 100%; padding: 2px 11px; line-height: 0; border: 0;"
      [style.backgroundColor]="getBackgroundColor()"
      (keydown)="onKeyDown($event)"
    />
  `,
  imports: [FormsModule, IMaskDirective],
})
export class NumericEditor<T> implements ICellEditorAngularComp, AfterViewInit {
  protected maxlength: number;
  protected minlength: number;
  protected mask: string;
  protected unmask: boolean;
  protected value: number;
  protected range = false;
  protected returnIfError = true;
  public static errBgColor = '#F5DBD9';
  private readonly input = viewChild('input', { read: ViewContainerRef });

  public static isCorrectValueCommon(
    value: number,
    minlength: number,
    maxlength: number,
    range: boolean,
  ): boolean {
    if (value === undefined || value === null) {
      return false;
    }
    const len = value.toString().length;
    return range ? len >= minlength && len <= maxlength : len === minlength || len === maxlength;
  }

  private static getCharCodeFromEvent(event) {
    // tslint:disable-next-line:triple-equals
    return typeof event.which == 'undefined' ? event.keyCode : event.which;
  }

  private static isCharNumeric(charStr): boolean {
    return !!/\d/.test(charStr);
  }

  private static isKeyPressedNumeric(event): boolean {
    const charCode = NumericEditor.getCharCodeFromEvent(event);
    const charStr = event.key ? event.key : String.fromCharCode(charCode);
    return NumericEditor.isCharNumeric(charStr);
  }

  public agInit(params: ICellEditorParams<T, number>): void {
    if (params['minlength']) {
      this.minlength = params['minlength'];
    }
    if (params['maxlength']) {
      this.maxlength = params['maxlength'];
    }
    if (params['mask']) {
      this.mask = params['mask'];
    }
    this.unmask = true;
    if (params['unmask'] !== undefined) {
      this.unmask = params['unmask'];
    }
    if (params['returnIfError'] !== undefined) {
      this.returnIfError = params['returnIfError'];
    }
    if (params['range']) {
      this.range = params['range'];
    }
    this.value = params.value;
  }

  public getValue(): number {
    return this.value;
  }

  public isCancelAfterEnd(): boolean {
    if (!this.returnIfError) {
      return !this.isCorrectValue();
    }
    return false;
  }

  protected getBackgroundColor(): string {
    if (this.isCorrectValue()) {
      return 'transparent';
    }
    return NumericEditor.errBgColor;
  }

  private isCorrectValue(): boolean {
    return NumericEditor.isCorrectValueCommon(
      this.value,
      this.minlength,
      this.maxlength,
      !this.range,
    );
  }

  protected onKeyDown(event): void {
    if (this.isKeyPressedNavigation(event)) {
      event.stopPropagation();
    }
  }

  private isKeyPressedNavigation(event) {
    return (
      event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 40
    );
  }

  // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
  public ngAfterViewInit() {
    setTimeout(() => {
      this.input().element.nativeElement.focus();
    });
  }
}

@Component({
  selector: 'simple-numeric-cell',
  template: `
    <input
      #input
      type="text"
      [ngModel]="value"
      (ngModelChange)="setValue($event)"
      [imask]="maskForSumm"
      unmask="typed"
    />
  `,
  imports: [FormsModule, IMaskDirective],
})
export class SimpleNumericEditor implements AfterViewInit {
  protected value: number;
  protected maskForSumm = maskForSumm;
  private readonly input = viewChild('input', { read: ViewContainerRef });

  public agInit(params: ICellEditorParams): void {
    this.value = params.value ?? '';
    if (params['removeValueAfterDot']) {
      this.maskForSumm.scale = 0;
    } else {
      this.maskForSumm.scale = 2;
    }
  }

  protected setValue(value) {
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.input().element.nativeElement.focus();
    });
  }
}
