import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { EMPTY, of } from 'rxjs';
import type { DownloadAllParams } from './download-all.component';
import { DownloadAllComponent } from './download-all.component';

describe('DownloadAllComponent', () => {
  beforeEach(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window.URL as unknown as { createObjectURL?: unknown }).createObjectURL;
  });

  it('downloads all files of the initialised row through the supplied callback', async () => {
    const downloaded: string[] = [];
    const requestedIds: number[] = [];
    (window.URL as unknown as { createObjectURL: () => string }).createObjectURL = () =>
      'blob:insurance';
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloaded.push(this.href);
      });
    const fixture = TestBed.createComponent(DownloadAllComponent);
    fixture.componentInstance.agInit({
      data: { id: 123 },
      downloadAll: (id: number) => {
        requestedIds.push(id);
        return of(new Blob(['policies']));
      },
    } as unknown as DownloadAllParams);
    await fixture.whenStable();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.textContent).toContain('Скачать все');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(downloaded).toEqual(['blob:insurance']);
    expect(requestedIds).toEqual([123]);
  });

  it('does nothing user-visible before the click', async () => {
    const downloadAll = jest.fn(() => EMPTY);
    const fixture = TestBed.createComponent(DownloadAllComponent);
    fixture.componentInstance.agInit({
      data: { id: 1 },
      downloadAll,
    } as unknown as DownloadAllParams);
    await fixture.whenStable();

    expect(downloadAll).not.toHaveBeenCalled();
    expect(fixture.componentInstance.refresh()).toBe(true);
  });
});
