import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ClarityModule, ClrNavigationModule } from '@clr/angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface HeaderBrand {
  title: string;
  logoUrl: string;
  homeLink: string;
}

export interface HeaderUser {
  name: string;
  avatarUrl?: string;
}

export interface HeaderLink {
  label: string;
  routerLink: string;
}

@Component({
  selector: 'sotbi-header',
  imports: [ClarityModule, ClrNavigationModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  public readonly loggedIn = input<boolean>(false);
  public readonly brand = input.required<HeaderBrand>();
  public readonly user = input<HeaderUser | null>(null);
  public readonly items = input<HeaderLink[]>([]);
  public readonly accountItems = input<HeaderLink[]>([]);

  public readonly online = input<boolean>(false);
  public readonly showSearch = input<boolean>(false);
  public readonly phrase = input<string>('');
  public readonly searchEvent = output<string>();
  public readonly logoutRequested = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTextChanged = new Subject<string>();

  public ngOnInit(): void {
    // Подписка создаётся только в online-режиме при инициализации (прежнее поведение)
    if (this.online()) {
      this.searchTextChanged
        .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
        .subscribe((phrase) => this.searchEvent.emit(phrase));
    }
  }

  public submitSearch(phrase: string): void {
    this.searchEvent.emit(phrase);
  }

  public onKeyUp(phrase: string): void {
    if (this.online()) {
      this.searchTextChanged.next(phrase);
    }
  }
}
