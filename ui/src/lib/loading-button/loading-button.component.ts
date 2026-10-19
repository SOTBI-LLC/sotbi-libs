import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

export enum LoadingButtonState {
  DEFAULT = 0,
  LOADING = 1,
  SUCCESS = 2,
  ERROR = 3,
}

/** Native button with the presentation contract of the former Clarity loading button. */
@Component({
  selector: 'button[sotbiLoading]',
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-busy]': 'state() === 1 ? "true" : null',
    '[style.width.px]': 'width()',
    '[style.transform]': 'blocked() ? "translateZ(0)" : null',
  },
})
export class LoadingButtonComponent {
  public readonly loading = input<boolean | number>(false, {
    alias: 'sotbiLoading',
  });
  public readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly state = signal(LoadingButtonState.DEFAULT);
  protected readonly width = signal<number | null>(null);
  protected readonly hasTransitioned = signal(false);
  protected readonly blocked = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.blocked(),
  );
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const value = this.loading();
      const next =
        value === true
          ? LoadingButtonState.LOADING
          : value || LoadingButtonState.DEFAULT;
      untracked(() => this.transition(next));
    });
    this.destroyRef.onDestroy(() => this.clearResetTimer());
  }

  private transition(next: LoadingButtonState): void {
    if (next === this.state()) return;
    this.clearResetTimer();
    this.hasTransitioned.set(true);
    if (
      next === LoadingButtonState.ERROR ||
      next === LoadingButtonState.DEFAULT
    ) {
      this.state.set(LoadingButtonState.DEFAULT);
      this.width.set(null);
      this.blocked.set(false);
      return;
    }
    this.width.set(
      Math.max(42, this.element.nativeElement.getBoundingClientRect().width),
    );
    this.state.set(next);
    if (next === LoadingButtonState.LOADING) {
      this.blocked.set(true);
    } else if (next === LoadingButtonState.SUCCESS) {
      this.resetTimer = setTimeout(
        () => this.transition(LoadingButtonState.DEFAULT),
        600,
      );
    }
  }

  private clearResetTimer(): void {
    if (this.resetTimer !== undefined) clearTimeout(this.resetTimer);
    this.resetTimer = undefined;
  }
}
