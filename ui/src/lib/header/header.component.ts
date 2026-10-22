import { NativeMainContainerDirective } from '../shell/native-main-container.directive';
import { NativeNavLevelDirective } from '../shell/native-nav-level.directive';
import { CdkMenuModule } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Renderer2,
  inject,
  input,
  output,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LucideChevronUp } from '@lucide/angular';

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

// CDK closes links on Space before a bubbling Angular key listener can run.
// Synthesize the native click in capture phase so RouterLink handles it once.
@Directive({ selector: '[libAccountMenuLinkSpace]' })
class AccountMenuLinkSpaceDirective {
  constructor() {
    const element =
      inject<ElementRef<HTMLAnchorElement>>(ElementRef).nativeElement;
    const unlisten = inject(Renderer2).listen(
      element,
      'keydown',
      (event: KeyboardEvent) => {
        if (
          event.key !== ' ' ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        event.preventDefault();
        event.stopImmediatePropagation();
        element.click();
      },
      { capture: true },
    );
    inject(DestroyRef).onDestroy(unlisten);
  }
}

@Component({
  selector: 'sotbi-header',
  imports: [
    AccountMenuLinkSpaceDirective,
    CdkMenuModule,
    LucideChevronUp,
    NativeNavLevelDirective,
    RouterLink,
    RouterLinkActive,
    FormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  protected readonly shell = inject(NativeMainContainerDirective, {
    optional: true,
  });
  protected openNavigation(level: 1 | 2, event: Event): void {
    this.shell?.open(level, event.currentTarget as HTMLElement);
  }
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
