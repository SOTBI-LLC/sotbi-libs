import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Params } from '@angular/router';
import { RouterLink } from '@angular/router';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  template: `
    @if (icon) {
      <img [src]="icon" [alt]="name" class="avatar" />
    }
    <a class="link-cell-ag-grid__link" [routerLink]="routerLink">
      {{ name }}
    </a>
  `,
  styles: [
    `
      .link-cell-ag-grid__link:link {
        text-decoration: none;
        color: #0079b8;
      }
      .link-cell-ag-grid__link:visited {
        color: #0079b8;
      }
      .link-cell-ag-grid__link:hover {
        text-decoration: underline;
      }
      .avatar {
        vertical-align: middle;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class LinkCellAgGridComponent implements ICellRendererAngularComp {
  protected name = '';
  protected routerLink = '';
  protected icon = '';

  public agInit(params: ICellRendererParams) {
    this.name = params.value;
    let r = '.';
    if (params['icon']) {
      this.icon = params['icon'];
    }
    if (params['route']) {
      r = '/' + params['route'];
    }
    let id = 0;
    if (params.data[params['linkTo']]) {
      id =
        params.data[params['linkTo']].debtor_id ||
        params.data[params['linkTo']] ||
        params.data[params['linkTo']].id ||
        0;
    } else {
      id = params.data.id;
    }
    this.routerLink = `${r}/${id}`;
  }

  public refresh(): boolean {
    return false;
  }
}
@Component({
  template: `
    @if (!absoluteURL) {
      <a
        class="link-cell-ag-grid__link"
        [routerLink]="link"
        [queryParams]="query"
      >
        {{ value }}
      </a>
    }
    @if (absoluteURL) {
      <a class="link-cell-ag-grid__link" href="{{ link }}" target="_blank">
        {{ value }}
      </a>
    }
  `,
  styles: [
    `
      .link-cell-ag-grid__link:link {
        text-decoration: none;
        color: #0079b8;
      }
      .link-cell-ag-grid__link:visited {
        color: #0079b8;
      }
      .link-cell-ag-grid__link:hover {
        text-decoration: underline;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class LinkCellComponent<T> implements ICellRendererAngularComp {
  protected value = '';
  protected link: string[] = [];
  protected query: Params | null = null;
  protected absoluteURL = false;

  public agInit(params: ICellRendererParams<T, string>) {
    this.value = params.value ?? '';
    this.link = params['linkTo'] ?? [];
    this.query = params['query'] ?? null;
    this.absoluteURL = params['absoluteURL'] ?? false;
  }

  public refresh(): boolean {
    return false;
  }
}
