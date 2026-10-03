import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import type { Interval } from '@sotbi/models';

import { RangeDateComponent } from './range-date.component';

@Component({
  imports: [RangeDateComponent],
  template: `
    <range-date
      [start]="start"
      [end]="end"
      [analytics]="analytics()"
      [loading]="false"
      [showButton]="showButton()"
      (selected)="selected.set($event)"
      (selectedFromDataPicker)="pickerSelected.set($event)"
      (confirm)="confirmed.set(true)"
    />
  `,
})
class HostComponent {
  start = new Date(2026, 9, 1);
  end: Date | null = new Date(2026, 9, 31);
  readonly analytics = signal(false);
  readonly showButton = signal(true);
  readonly selected = signal<Interval | null>(null);
  readonly pickerSelected = signal<Interval | null>(null);
  readonly confirmed = signal(false);
}

describe('RangeDate', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const createHost = async (setup: (host: HostComponent) => void = () => undefined): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    setup(host);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const periodText = () =>
    (fixture.nativeElement.querySelector('.summary') as HTMLElement).textContent!.trim();

  const clickPreset = async (name: string) => {
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a.clickable'),
    ) as HTMLAnchorElement[];
    const link = links.find((a) => a.textContent!.trim() === name)!;
    link.click();
    await fixture.whenStable();
  };

  it('creates and shows the selected period in Russian', async () => {
    await createHost();

    const text = periodText();
    expect(text).toContain('Выбрано:');
    expect(text).toContain('октября 2026');
  });

  it('shows the empty-period message when end is not set', async () => {
    await createHost((h) => (h.end = null));

    expect(periodText()).toBe('период не выбран');
  });

  it('emits selected with preset dates after clicking a preset link', async () => {
    await createHost();

    await clickPreset('сегодня');

    const result = host.selected()!;
    const today = new Date();
    expect(result.start.toDateString()).toBe(today.toDateString());
    expect(result.end.toDateString()).toBe(today.toDateString());
    expect(result.start <= result.end).toBe(true);
  });

  it('emits selectedFromDataPicker when a date input changes', async () => {
    await createHost();
    const input = fixture.nativeElement.querySelector('#end') as HTMLInputElement;
    input.value = '2026-11-15';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    const result = host.pickerSelected()!;
    expect(result.end.getFullYear()).toBe(2026);
    expect(result.end.getMonth()).toBe(10);
    expect(result.end.getDate()).toBe(15);
  });

  it('swaps start and end when the picker sets them in reverse order', async () => {
    await createHost();
    const startInput = fixture.nativeElement.querySelector('#start') as HTMLInputElement;
    startInput.value = '2026-12-01';
    startInput.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    const result = host.pickerSelected()!;
    expect(result.start <= result.end).toBe(true);
  });

  it('emits confirm when the data button is clicked', async () => {
    await createHost();

    const button = fixture.nativeElement.querySelector(
      'button.margin-btn',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(host.confirmed()).toBe(true);
  });

  it('hides the data button when showButton is false', async () => {
    await createHost((h) => h.showButton.set(false));

    expect(fixture.nativeElement.querySelector('button.margin-btn')).toBeNull();
  });

  it('offers analytics presets in analytics mode and starts from the previous month', async () => {
    await createHost((h) => h.analytics.set(true));

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a.clickable'),
    ).map((a) => (a as HTMLAnchorElement).textContent!.trim());
    expect(links).toEqual(['3 месяца', 'текущий год', '3 года', 'За всю историю']);
    expect(host.start.getMonth()).toBe(new Date().getMonth() - 1);
    expect(host.start.getDate()).toBe(1);
  });

  it('sets a three months window from the analytics preset', async () => {
    await createHost((h) => h.analytics.set(true));

    await clickPreset('3 месяца');

    const result = host.selected()!;
    const now = new Date();
    expect(result.start.getDate()).toBe(1);
    expect(result.start.getMonth()).toBe(now.getMonth() - 3);
    expect(result.end.getDate()).toBe(1);
    expect(result.end.getMonth()).toBe(now.getMonth());
  });
});
