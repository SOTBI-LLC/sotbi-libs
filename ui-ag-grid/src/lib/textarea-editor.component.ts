import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrIconModule } from '@clr/angular';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { Column, GridApi, RowNode } from 'ag-grid-community';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [style.width]="cellWidth"
      [style.background]="show ? 'white' : 'rgb(183, 228, 255)'"
      [style.borderLeft]="'1px solid #0091ea'"
      [ngStyle]="
        (show &&
          upOrDown > 0.7 && {
            bottom: bottom,
          }) || {
          top: '0',
        }
      "
      class="ng-select container"
    >
      <textarea
        (click)="expand()"
        (mouseover)="mouseover($event)"
        (keydown)="noEnter($event)"
        (keyup)="keyup()"
        [(ngModel)]="value"
        [style.width]="show ? cellWidth : cellWidthTextareaReadonly"
        [style.background]="show ? 'white' : 'rgb(183, 228, 255)'"
        [style.border]="show ? '1px solid blue' : 'none'"
        [style.height]="show ? cellHeightTextarea : cellHeightTextareaReadonly"
        [style.resize]="show ? '' : 'none'"
        class="textarea"
      ></textarea>
      @if (!show) {
        <span
          (click)="delete()"
          class="ng-clear-wrapper ng-star-inserted clear"
          title="Очистить поле"
          ><span aria-hidden="true" class="ng-clear x-clear">×</span></span
        >
      }
      @if (!show) {
        <span (click)="expand()" class="ng-arrow-wrapper down-arrow"
          ><span class="ng-arrow"></span
        ></span>
      }
      @if (show) {
        <button
          class="m-0 button-ok btn btn-primary btn-block"
          (click)="save()"
        >
          <cds-icon class="check m-0" shape="check"></cds-icon>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        position: absolute;
      }
      .textarea {
        border: none;
        overflow: hidden;
        padding: 3px 0 0 10px;
        font-family: monospace;
        word-break: break-all;
      }
      .clear {
        position: absolute !important;
        right: 2%;
        top: 45%;
        transform: translate(-50%, -50%);
      }
      .x-clear {
        font-size: 16px;
        padding-right: 5px;
      }
      .down-arrow {
        position: absolute !important;
        right: 0;
        display: flex;
        height: 100%;
        align-items: center;
      }
      .button-ok {
        height: 27px;
      }
      .check {
        width: 28px;
        height: 28px;
      }
      ::ng-deep .ag-theme-balham .ag-popup-child:not(.ag-tooltip-custom) {
        box-shadow: none !important;
        border-color: #0091ea;
      }
    `,
  ],
  imports: [NgStyle, FormsModule, ClrIconModule],
})
export class TextareaEditor implements ICellEditorAngularComp {
  protected value = '';
  protected show = false;
  private api: GridApi | null = null;
  cellWidth: string;
  cellWidthTextareaReadonly: string;
  cellHeightTextareaReadonly: string;
  cellHeightTextarea: string;
  protected upOrDown = 0;
  bottom: string;
  altState = false;

  agInit({ api, column, value, node }): void {
    this.api = api;
    const columnGrid: Column = column;
    const nodeGrid: RowNode = node;

    const sumRows = this.api?.getDisplayedRowCount() + 1;
    const currentRow = Number(nodeGrid.rowIndex) + 1;
    this.upOrDown = currentRow / sumRows;

    this.value = value;
    this.cellWidth = columnGrid.getActualWidth() - 2 + 'px';
    this.cellWidthTextareaReadonly = columnGrid.getActualWidth() - 35 + 'px';
    this.cellHeightTextareaReadonly = nodeGrid.rowHeight - 3 + 'px';
    this.cellHeightTextarea = nodeGrid.rowHeight + 40 + 'px';
    this.bottom = -nodeGrid.rowHeight + 2 + 'px';
  }

  getValue(): string {
    return this.value;
  }

  isPopup(): boolean {
    return true;
  }

  save() {
    this.api.stopEditing();
    this.api.resetRowHeights();
  }

  noEnter(event) {
    if (event.key === 'Enter' && this.altState === false) {
      this.save();
    }

    if (event.altKey) {
      this.altState = true;
    }

    if (event.key === 'Enter' && this.altState) {
      this.value = this.value + '\r\n';
      event.stopPropagation();
    }
  }

  keyup() {
    this.altState = false;
  }

  expand() {
    this.show = true;
  }

  delete() {
    this.value = null;
    this.save();
  }

  mouseover(event) {
    if (this.show) {
      event.srcElement.focus();
    }
  }
}
