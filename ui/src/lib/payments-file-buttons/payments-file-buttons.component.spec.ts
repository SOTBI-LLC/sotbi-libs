import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ClrLoadingState } from '@clr/angular';
import { PaymentsFileButtonsComponent } from './payments-file-buttons.component';

@Component({
  selector: 'lib-test-host',
  imports: [PaymentsFileButtonsComponent],
  template:
    '<pauments-file-buttons (filesSelected)="selected.push($event)" (exportRequested)="exports.push(true)" />',
})
class Host {
  readonly selected: File[][] = [];
  readonly exports: boolean[] = [];
}

const setInputFiles = (input: HTMLInputElement, files: File[]): void => {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: Object.assign([...files], { item: (i: number) => files[i] }),
  });
};

describe('PaymentsFileButtonsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    });
  });

  it('reports the selected files to the parent', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const files = [new File(['first'], 'first.txt'), new File(['second'], 'second.txt')];

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    setInputFiles(input, files);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.selected).toEqual([files]);
    expect(fixture.componentInstance.selected[0][0]).toBe(files[0]);
    expect(fixture.componentInstance.selected[0][1]).toBe(files[1]);
  });

  it('reports a repeated selection of the same files', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const files = [new File(['same'], 'same.txt')];
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');

    setInputFiles(input, files);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    setInputFiles(input, files);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.selected).toEqual([files, files]);
  });

  it('requests an export when the download button is clicked', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button[aria-label="Скачать файл"]').click();
    await fixture.whenStable();

    expect(fixture.componentInstance.exports).toEqual([true]);
  });

  it('displays the supplied upload state and enables buttons after it finishes', async () => {
    const fixture = TestBed.createComponent(PaymentsFileButtonsComponent);
    fixture.componentRef.setInput('uploadState', ClrLoadingState.LOADING);
    await fixture.whenStable();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    expect(buttons.every((button) => button.disabled)).toBe(true);
    expect(fixture.nativeElement.querySelector('.spinner')).toBeTruthy();

    fixture.componentRef.setInput('uploadState', ClrLoadingState.DEFAULT);
    await fixture.whenStable();
    expect(buttons.every((button) => !button.disabled)).toBe(true);
    expect(fixture.nativeElement.querySelector('.spinner')).toBeNull();
  });
});
