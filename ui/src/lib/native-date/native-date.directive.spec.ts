import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NativeDateValueAccessorDirective } from './native-date.directive';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [NativeDateValueAccessorDirective, FormsModule],
  template: `<input type="date" nativeDate [(ngModel)]="dateValue">`,
})
class TestComponent {
  public dateValue: Date | null = null;
  public inputEl = viewChild<NativeDateValueAccessorDirective>(NativeDateValueAccessorDirective);
}

describe('NativeDateValueAccessorDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  it('should create an instance', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const directive = fixture.componentInstance.inputEl();
    expect(directive).toBeTruthy();
  });

  it('should apply clr-input class for Clarity-compatible styling', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.classList.contains('clr-input')).toBe(true);
  });
});
