import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Публичный descriptor вложения, структурно совместимый с DownloadFile из data-access. */
export interface DownloadFileDescriptor {
  file?: string;
  original_file_name?: string;
}

/**
 * Скачивает вложение через переданный обработчик потребителя и отдаёт полученный
 * файл пользователю.
 */
export const downloadAttachment = <T extends DownloadFileDescriptor>(
  attachment: T,
  srv: { download(attachment: T): Observable<BlobPart> },
): Observable<BlobPart> => {
  return srv.download(attachment).pipe(
    tap((data: BlobPart) => {
      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = attachment.original_file_name ?? '';
      link.click();
      link.remove();
    }),
  );
};

export const excelFormats = [
  '.xlsx',
  '.XLSX',
  '.xlsm',
  '.XLSM',
  '.xlsb',
  '.XLSB',
  '.xltx',
  '.XLTX',
  '.xltm',
  '.XLTM',
  '.xls',
  '.XLS',
  '.xlt',
  '.XLT',
  '.xml',
  '.XML',
  '.xlam',
  '.XLAM',
  '.xla',
  '.XLA',
  '.xlw',
  '.XLW',
  '.csv',
  '.CSV',
];

export const checkXlsFileType = (file: string): boolean => {
  const splitFile = file.toLocaleLowerCase('ru-Ru').split('.');
  const addDotFile = '.' + splitFile[splitFile.length - 1];
  return excelFormats.includes(addDotFile);
};
