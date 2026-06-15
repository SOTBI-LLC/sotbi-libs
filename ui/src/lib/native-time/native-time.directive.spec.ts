import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NativeTimeValueAccessorDirective } from './native-time.directive';

@Component({
  imports: [NativeTimeValueAccessorDirective, FormsModule],
  template: `<input type="time" nativeTime [(ngModel)]="timeValue" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  public timeValue: number | null = null;
  public inputEl = viewChild<NativeTimeValueAccessorDirective>(
    NativeTimeValueAccessorDirective,
  );
}

describe('NativeTimeValueAccessorDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create an instance', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const directive = fixture.componentInstance.inputEl();
    expect(directive).toBeTruthy();
  });

  it('should write minutes as HH:MM', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.timeValue = 23 * 60 + 59;
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.value).toBe('23:59');
  });

  it('should convert input value to minutes on change', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '01:30';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(fixture.componentInstance.timeValue).toBe(90);
  });

  it('should convert input value to minutes on blur', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '02:10';
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(fixture.componentInstance.timeValue).toBe(130);
  });

  it('should set null when input is cleared', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.componentInstance.timeValue = 60;
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(fixture.componentInstance.timeValue).toBeNull();
  });
});
