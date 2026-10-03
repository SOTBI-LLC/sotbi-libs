import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Component, signal } from '@angular/core';
import type { Progress } from '@sotbi/models';

import { ProgressBarComponent } from './progress-bar.component';

@Component({
  imports: [ProgressBarComponent],
  template: `
    <progress-bar [progress]="progress()" [showProgress]="showProgress()" />
  `,
})
class HostComponent {
  public readonly progress = signal<Progress>({ value: 50, status: [1, 1, 0] });
  public readonly showProgress = signal(true);
}

describe('ProgressBar', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const createHost = async (setup: (host: HostComponent) => void = () => undefined): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    setup(host);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('creates', async () => {
    await createHost();
    expect(
      fixture.nativeElement.querySelector('progress-bar .custom-progress-bar'),
    ).toBeTruthy();
  });

  it('renders one segment per status with success and error states', async () => {
    await createHost();
    const el: HTMLElement = fixture.nativeElement;

    const items = el.querySelectorAll('.custom-progress-bar__item');
    expect(items.length).toBe(3);
    expect(el.querySelectorAll('.custom-progress-bar__item--success').length).toBe(2);
    expect(el.querySelectorAll('.custom-progress-bar__item--error').length).toBe(1);
  });

  it('shows the progress value with the great-50 accent', async () => {
    await createHost();
    const el: HTMLElement = fixture.nativeElement;

    const value = el.querySelector('.custom-progress-bar__list-progress-value')!;
    expect(value.textContent).toContain('50%');
    expect(value.classList.contains('custom-progress-bar__list-progress-value--great50')).toBe(true);
  });

  it('marks the value green at 100 percent', async () => {
    await createHost((h) => h.progress.set({ value: 100, status: [1, 1] }));

    const value = fixture.nativeElement.querySelector(
      '.custom-progress-bar__list-progress-value',
    )!;
    expect(value.classList.contains('custom-progress-bar__list-progress-value--100')).toBe(true);
  });

  it('falls back to the plain progress bar when showProgress is false', async () => {
    await createHost((h) => h.showProgress.set(false));
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.custom-progress-bar__list')).toBeNull();
    const plain = el.querySelector('.progress.flash.labeled')!;
    expect(plain).toBeTruthy();
    expect(plain.querySelector('progress')!.getAttribute('value')).toBe('50');
    expect(plain.querySelector('span')!.textContent).toContain('50%');
  });
});
