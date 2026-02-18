import type { AfterViewInit, ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';
import { IMaskDirective } from 'angular-imask';

@Component({
  template: `
    <input
      #input
      [type]="type"
      [min]="min"
      [max]="max"
      [step]="step"
      [imask]="{ mask: mask }"
      [(ngModel)]="value"
    />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IMaskDirective],
})
export class IMaskEdit implements ICellEditorAngularComp, AfterViewInit {
  private readonly input = viewChild<ElementRef>('input');

  protected value: string | number = '';
  protected min = '0';
  protected max = '100';
  protected mask = '00';
  protected type = 'text';
  protected step = 1;

  public agInit(params: ICellEditorParams): void {
    if (params['mask']) {
      this.mask = params['mask'];
    }
    if (params['type']) {
      this.type = params['type'];
    }
    if (params['min']) {
      this.min = params['min'];
    }
    if (params['max']) {
      this.max = params['max'];
    }
    if (params['step']) {
      this.step = params['step'];
    }
    this.value = params['value'] + '';
  }

  public getValue(): string | number {
    return this.value;
  }

  public isPopup(): boolean {
    return false;
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.input()?.nativeElement.focus();
    });
  }
}
