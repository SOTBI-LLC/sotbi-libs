import type { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import type { IHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';

interface ICustomHeaderParams {
  title: string;
  tooltip: string;
  html: string;
  click: () => void;
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span title="{{ tooltip }}">{{ title }}</span>
    <button
      class="btn btn-link btn-icon btn-sm"
      #image
      (click)="click($event)"
      [attr.aria-label]="tooltip"
    ></button>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
})
export class CustomHeaderComponent implements IHeaderAngularComp {
  private params!: IHeaderParams & ICustomHeaderParams;
  protected title = '';
  protected tooltip = '';

  public readonly image = viewChild<ElementRef>('image');

  public agInit(params: IHeaderParams & ICustomHeaderParams) {
    this.params = params;
    this.title = params.title;
    this.tooltip = params.tooltip;

    const imageElement = this.image();
    if (imageElement) {
      imageElement.nativeElement.innerHTML = params.html;
    }
  }
  public refresh(_: IHeaderParams) {
    return false;
  }

  public click(event: Event) {
    if (this.params.click) {
      this.params.click();
    }
    event.stopPropagation(); // preventDefault();
  }
}
