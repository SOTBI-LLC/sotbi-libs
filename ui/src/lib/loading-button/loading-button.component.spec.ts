import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import {
  LoadingButtonComponent,
  LoadingButtonState,
} from './loading-button.component';

@Component({
  imports: [LoadingButtonComponent],
  template: `<button
    type="button"
    [sotbiLoading]="loading()"
    [disabled]="disabled()"
    (click)="clicks = clicks + 1"
  >
    Сохранить
  </button>`,
})
class HostComponent {
  public readonly loading = signal<boolean | LoadingButtonState>(false);
  public readonly disabled = signal(false);
  public clicks = 0;
}

describe('LoadingButton', () => {
  let fixture: ComponentFixture<HostComponent>;
  let button: HTMLButtonElement;
  const render = (): void => fixture.detectChanges();
  const setState = (value: boolean | LoadingButtonState): void => {
    fixture.componentInstance.loading.set(value);
    render();
  };
  beforeEach(async () => {
    jest.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    render();
    button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });
  afterEach(() => {
    fixture.destroy();
    jest.useRealTimers();
  });

  it('keeps a native button with its projected label and click handler', () => {
    expect(button.tagName).toBe('BUTTON');
    expect(button.disabled).toBe(false);
    expect(button.querySelector('.clr-loading-btn-content')?.textContent?.trim()).toBe(
      'Сохранить',
    );
    button.click();
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('freezes the current width and prevents repeated clicks while loading', () => {
    jest
      .spyOn(button, 'getBoundingClientRect')
      .mockReturnValue({ width: 118 } as DOMRect);
    setState(true);
    expect(button.style.width).toBe('118px');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.spinner-inline')).not.toBeNull();
    button.click();
    expect(fixture.componentInstance.clicks).toBe(0);
    setState(false);
    expect(button.disabled).toBe(false);
    expect(button.style.width).toBe('');
  });

  it('uses the former 42px minimum for a small button', () => {
    jest
      .spyOn(button, 'getBoundingClientRect')
      .mockReturnValue({ width: 20 } as DOMRect);
    setState(LoadingButtonState.LOADING);
    expect(button.style.width).toBe('42px');
  });

  it('shows success for 600ms then restores the label without changing the caller state', () => {
    setState(LoadingButtonState.LOADING);
    setState(LoadingButtonState.SUCCESS);
    expect(button.querySelector('.spinner-check')).not.toBeNull();
    expect(button.disabled).toBe(true);
    jest.advanceTimersByTime(599);
    render();
    expect(button.querySelector('.spinner-check')).not.toBeNull();
    jest.advanceTimersByTime(1);
    render();
    expect(button.querySelector('.spinner')).toBeNull();
    expect(
      button.querySelector<HTMLElement>('.clr-loading-btn-content')?.hidden,
    ).toBe(false);
    expect(button.disabled).toBe(false);
    expect(fixture.componentInstance.loading()).toBe(
      LoadingButtonState.SUCCESS,
    );
  });

  it('returns immediately after error while retaining the business disabled condition', () => {
    fixture.componentInstance.disabled.set(true);
    setState(LoadingButtonState.LOADING);
    setState(LoadingButtonState.ERROR);
    expect(button.querySelector('.spinner')).toBeNull();
    expect(button.disabled).toBe(true);
    fixture.componentInstance.disabled.set(false);
    render();
    expect(button.disabled).toBe(false);
  });

  it('does not let an earlier success timer interrupt a newer request', () => {
    setState(LoadingButtonState.SUCCESS);
    jest.advanceTimersByTime(300);
    setState(LoadingButtonState.LOADING);
    jest.advanceTimersByTime(600);
    render();
    expect(button.disabled).toBe(true);
    expect(
      button.querySelector('.spinner-inline:not(.spinner-check)'),
    ).not.toBeNull();
  });

  it('cancels its reset timer on destruction', () => {
    setState(LoadingButtonState.SUCCESS);
    fixture.destroy();
    expect(jest.getTimerCount()).toBe(0);
  });
});
