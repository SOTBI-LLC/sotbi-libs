import type { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span title="{{ this.tooltip }}">{{ this.title }}</span>
    <button
      class="btn btn-link btn-icon btn-sm"
      #image
      (click)="click($event)"
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
export class CustomHeaderComponent {
  params;
  title;
  tooltip;

  readonly image = viewChild<ElementRef>('image');

  agInit(params) {
    this.params = params;
    this.title = this.params.title;
    this.tooltip = this.params.tooltip;
    this.image().nativeElement.innerHTML = this.params.html;
  }

  click(event: Event) {
    if (this.params.click) {
      this.params.click();
    }
    event.stopPropagation(); // preventDefault();
  }
}
