import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EMPTY, of } from 'rxjs';
import { DropFileComponent, DropFileParams } from './drop-file.component';

describe('DropFileComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window.URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  });

  it('returns the uploaded file when the user selects a file', async () => {
    const fixture = TestBed.createComponent(DropFileComponent);
    fixture.componentInstance.agInit({
      data: {},
      api: { stopEditing: () => undefined },
      downloadFile: () => EMPTY,
      uploadFiles: (files: FileList) =>
        files[0].name === 'extract.pdf'
          ? of([{ file: 'egrn/extract.pdf', original_file_name: 'extract.pdf' }])
          : EMPTY,
    } as unknown as DropFileParams);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['extract'], 'extract.pdf')],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.getValue()).toEqual({
      file: 'egrn/extract.pdf',
      original_file_name: 'extract.pdf',
    });
  });

  it('downloads the existing file when the user clicks its name', async () => {
    const downloaded: string[] = [];
    (window.URL as unknown as { createObjectURL: () => string }).createObjectURL = () =>
      'blob:extract';
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloaded.push(this.download);
      });
    const fixture = TestBed.createComponent(DropFileComponent);
    fixture.componentInstance.agInit({
      data: { file: 'egrn/extract.pdf', original_file_name: 'extract.pdf' },
      api: { stopEditing: () => undefined },
      uploadFiles: () => EMPTY,
      downloadFile: (attachment) =>
        attachment.file === 'egrn/extract.pdf' ? of(new Blob(['extract'])) : EMPTY,
    } as unknown as DropFileParams);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(downloaded).toEqual(['extract.pdf']);
  });

  it('does not download when the value has no file', async () => {
    const downloadFile = jest.fn(() => EMPTY);
    const fixture = TestBed.createComponent(DropFileComponent);
    fixture.componentInstance.agInit({
      data: {},
      api: { stopEditing: () => undefined },
      uploadFiles: () => EMPTY,
      downloadFile,
    } as unknown as DropFileParams);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(downloadFile).not.toHaveBeenCalled();
  });
});
