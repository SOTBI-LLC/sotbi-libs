import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
        (focus)="mouseover($event)"
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
          (click)="expand()"
          (keydown.enter)="expand()"
          (keydown.space)="expand()"
          class="ng-arrow-wrapper down-arrow"
          tabindex="0"
          role="button"
          ><span class="ng-arrow"></span
        ></span>
      }
      @if (show) {
        <button
          class="m-0 button-ok btn btn-primary btn-block"
          (click)="save()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 36 36"
            aria-hidden="true"
            class="check m-0"
          >
            <path
              fill="currentColor"
              d="M13.759 28.5L3.2909 17.8985C2.94988 17.4948 2.97281 16.8931 3.34353 16.5173C3.71424 16.1415 4.30784 16.1182 4.70604 16.4639L13.7389 25.6207L31.3931 7.74465C31.7913 7.39895 32.3849 7.4222 32.7556 7.798C33.1263 8.1738 33.1492 8.77554 32.8082 9.17921L13.759 28.5Z"
            />
          </svg>
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
  imports: [NgStyle, FormsModule],
})
export class TextareaEditor implements ICellEditorAngularComp {
  protected value = '';
  protected show = false;
  private api: GridApi | null = null;
  protected cellWidth = '';
  protected cellWidthTextareaReadonly = '';
  protected cellHeightTextareaReadonly = '';
  protected cellHeightTextarea = '';
  protected upOrDown = 0;
  protected bottom = '';
  protected altState = false;

  public agInit({ api, column, value, node }): void {
    this.api = api;
    const columnGrid: Column = column;
    const nodeGrid: RowNode = node;

    const sumRows = api.getDisplayedRowCount() + 1;
    const currentRow = Number(nodeGrid.rowIndex) + 1;
    this.upOrDown = currentRow / sumRows;

    this.value = value;
    this.cellWidth = columnGrid.getActualWidth() - 2 + 'px';
    this.cellWidthTextareaReadonly = columnGrid.getActualWidth() - 35 + 'px';
    this.cellHeightTextareaReadonly = nodeGrid.rowHeight
      ? nodeGrid.rowHeight - 3 + 'px'
      : '10px';
    this.cellHeightTextarea = nodeGrid.rowHeight
      ? nodeGrid.rowHeight + 40 + 'px'
      : '10px';
    this.bottom = nodeGrid.rowHeight ? -nodeGrid.rowHeight + 2 + 'px' : '10px';
  }

  public getValue(): string {
    return this.value;
  }

  public isPopup(): boolean {
    return true;
  }

  protected save() {
    this.api?.stopEditing();
    this.api?.resetRowHeights();
  }

  public noEnter(event) {
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

  protected keyup() {
    this.altState = false;
  }

  protected expand() {
    this.show = true;
  }

  protected mouseover(event) {
    if (this.show) {
      event.srcElement.focus();
    }
  }
}
