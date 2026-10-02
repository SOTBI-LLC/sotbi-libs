import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import type { FileTypeRendererParams } from './file-type-renderer.component';
import { FileTypeRendererComponent } from './file-type-renderer.component';

describe('FileTypeRendererComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window.URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  });

  const createRenderer = (params: Record<string, unknown>) => {
    const fixture = TestBed.createComponent(FileTypeRendererComponent);
    fixture.componentInstance.agInit(params as unknown as FileTypeRendererParams);
    fixture.detectChanges();
    return fixture;
  };

  it('downloads the displayed file through the supplied download operation', async () => {
    const downloaded: string[] = [];
    (window.URL as unknown as { createObjectURL: () => string }).createObjectURL = () =>
      'blob:payment-file';
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloaded.push(this.download);
      });
    const fixture = createRenderer({
      data: { type: true },
      value: 'payments/order.pdf',
      downloadFile: () => of(new Blob(['payment order'])),
    });

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(downloaded).toEqual(['order.pdf']);
  });

  it('does not download when the click handler receives no attachment', async () => {
    const downloadFile = jest.fn(() => EMPTY);
    const fixture = createRenderer({
      data: {},
      value: 'readme.txt',
      downloadFile,
    });

    expect(fixture.nativeElement.querySelector('a')).toBeTruthy();
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('renders a pdf icon for typed pdf values', () => {
    const fixture = createRenderer({
      data: { type: true },
      value: 'payments/order.pdf',
      downloadFile: () => EMPTY,
    });

    expect(fixture.nativeElement.querySelector('[data-file-icon="pdf"]')).toBeTruthy();
  });

  it('renders an excel icon for typed spreadsheet values', () => {
    const fixture = createRenderer({
      data: { type: true },
      value: 'payments/report.xlsx',
      downloadFile: () => EMPTY,
    });

    expect(fixture.nativeElement.querySelector('[data-file-icon="excel"]')).toBeTruthy();
  });

  it('renders a text icon for untyped values', () => {
    const fixture = createRenderer({
      data: {},
      value: 'docs/readme.txt',
      downloadFile: () => EMPTY,
    });

    expect(fixture.nativeElement.querySelector('[data-file-icon="txt"]')).toBeTruthy();
  });

  it('renders inline icons without the timetable sprite', () => {
    const fixture = createRenderer({
      data: { type: true },
      value: 'payments/order.pdf',
      downloadFile: () => EMPTY,
    });

    expect(fixture.nativeElement.querySelector('use')).toBeNull();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('keeps refresh declarative', () => {
    const fixture = createRenderer({
      data: { type: true },
      value: 'payments/order.pdf',
      downloadFile: () => EMPTY,
    });

    expect(fixture.componentInstance.refresh()).toBe(false);
  });
});
