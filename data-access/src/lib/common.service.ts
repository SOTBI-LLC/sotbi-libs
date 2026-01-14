import { HttpClient, HttpParams } from '@angular/common/http';
import { removeID } from '@sotbi/utils';
import { Observable } from 'rxjs';

export interface DownloadFile {
  file?: string;
  original_file_name?: string;
}

interface ICommon<T> {
  readonly path: string;
  GetAll(id: number): Observable<T[]>;
  get(id: number): Observable<T>;
  add(item: Partial<T>): Observable<T>;
  update(item: Partial<T> & { id: number }): Observable<T>;
  delete(id: number): Observable<void>;
  download(file: string, params: HttpParams): Observable<BlobPart>;
  download(attachment: DownloadFile): Observable<BlobPart>;
}

export class CommonService<T> implements ICommon<T> {
  public path = '/api/';
  constructor(protected readonly http: HttpClient) {}
  public GetAll(id: number | null = null): Observable<T[]> {
    if (id) {
      return this.http.get<T[]>(`${this.path}s/${id}`);
    } else {
      return this.http.get<T[]>(`${this.path}s`);
    }
  }
  public get(id: number): Observable<T> {
    return this.http.get<T>(`${this.path}/${id}`);
  }
  public add(item: Partial<T>): Observable<T> {
    return this.http.post<T>(this.path, item);
  }
  public update(item: Partial<T> & { id: number }): Observable<T> {
    return this.http.put<T>(`${this.path}/${item.id}`, removeID(item));
  }
  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }
  public download(
    file: string | DownloadFile,
    params = new HttpParams()
  ): Observable<BlobPart> {
    if (typeof file === 'string') {
      return this.http.get(
        `${this.path}/download/${file.replace(/\//gi, '|')}`,
        {
          params,
          responseType: 'blob',
        }
      );
    } else {
      return this.http.post(`${this.path}/download`, file, {
        responseType: 'blob',
      });
    }
  }
}
