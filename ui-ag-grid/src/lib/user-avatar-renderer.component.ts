import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  template: `
    @if (!!avatar) {
      <img
        [style.--avatar-size]="size"
        [src]="avatar"
        [alt]="user"
        class="avatar"
      />
    }
    {{ user }}
  `,
  styles: [
    `
      :root {
        --avatar-size: 1rem;
      }
      :host {
        display: block;
      }
      .avatar {
        vertical-align: middle;
        width: var(--avatar-size, 1rem);
        height: var(--avatar-size, 1rem);
        border-radius: 50%;
      }
    `,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarRendererComponent implements ICellRendererAngularComp {
  public size = '';
  public avatar = '';
  public user = 0;
  public agInit(params) {
    this.size = params.size;
    this.avatar = params.avatar;
    this.user = params.user;
  }

  public refresh(): boolean {
    return false;
  }
}
