import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import type {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import type { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';

@Component({
  imports: [],
  template: `
    @if (avatar()) {
      <img
        [style.--avatar-size]="size()"
        [src]="avatar()"
        [alt]="user()"
        class="avatar"
      />
    }
    {{ user() }}
  `,
  styles: `
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserWithAvatarComponent
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  public readonly size = input<string>('1rem');
  protected readonly user = signal<string | null>('Guest');
  protected readonly avatar = signal<string | null>('');

  public agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.user.set(params['user'] ?? 'Guest');
    this.avatar.set(params['avatar'] ?? null);
  }

  public refresh() {
    return true;
  }

  public getValue(): string {
    return this.user() ?? '';
  }
}
