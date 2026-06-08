import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NativeDateValueAccessorDirective } from './native-date.directive';

@Component({
  imports: [NativeDateValueAccessorDirective, FormsModule],
  template: `<input type="date" nativeDate [(ngModel)]="dateValue" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  public dateValue: Date | null = null;
  public inputEl = viewChild<NativeDateValueAccessorDirective>(NativeDateValueAccessorDirective);
}

describe('NativeDateValueAccessorDirective', () => {
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
});
