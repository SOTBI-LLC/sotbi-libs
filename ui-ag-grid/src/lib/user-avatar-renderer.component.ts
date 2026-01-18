import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  template: `
    @if (!!avatar) {
      <img [style.--avatar-size]="size" [src]="avatar" [alt]="user" class="avatar" />
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
})
export class UserAvatarRendererComponent implements ICellRendererAngularComp {
  size: string;
  avatar: string;
  user: number;
  agInit(params) {
    this.size = params.size;
    this.avatar = params.avatar;
    this.user = params.user;
  }

  refresh(): boolean {
    return false;
  }
}
