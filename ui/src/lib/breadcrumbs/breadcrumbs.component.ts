import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="container">
      <div class="item">
        <ul class="breadcrumb">
          @for (item of path(); track $index) {
            <li class="breadcrumb-item">{{ item }}</li>
          }
        </ul>
      </div>
      <div class="item">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .container {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        align-content: stretch;
        padding-bottom: 4px;
      }

      .item {
        display: block;
        flex-grow: 0;
        flex-shrink: 1;
        flex-basis: auto;
        align-self: auto;
        order: 0;
      }

      .item:nth-last-child(0) > div {
        margin-right: 0 !important;
      }

      .breadcrumb {
        color: #666666;
        text-overflow: ellipsis;
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
      }

      .breadcrumb-item:after {
        content: '/';
        padding: 0 10px;
      }

      .breadcrumb-item:last-child:after {
        content: none;
        padding-left: 0;
      }

      .breadcrumb-item:last-child {
        margin-right: 0;
      }
    `,
  ],
})
export class BreadcrumbsComponent {
  protected readonly path = input.required<string[]>();
}
