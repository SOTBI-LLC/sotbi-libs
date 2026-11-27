import {
  HttpContext,
  HttpContextToken,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { CatalogAppraiser, SaveAppraiserRequest } from '@sotbi/models';
import { firstValueFrom } from 'rxjs';
import { AppraiserService } from './appraiser.service';

describe('AppraiserService', () => {
  const token = new HttpContextToken(() => false);
  const item: SaveAppraiserRequest = {
    surname: 'Иванов',
    name: 'Иван',
    patronymic_name: null,
    inn: '500100732259',
    snils: '11223344595',
    sro_id: 4,
  };
  const { patronymic_name: _, ...fields } = item;
  const saved: CatalogAppraiser = { id: 7, ...fields };
  let http: HttpTestingController;
  let service: AppraiserService;
  let context: HttpContext;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AppraiserService);
    context = new HttpContext().set(token, true);
  });

  afterEach(() => http.verify());

  it('fetches the catalog', async () => {
    const result = firstValueFrom(service.getAll(context));
    const request = http.expectOne({ method: 'GET', url: '/api/appraisers' });
    expect(request.request.context.get(token)).toBe(true);
    request.flush([saved]);
    await expect(result).resolves.toEqual([saved]);
  });

  it('creates an appraiser', async () => {
    const result = firstValueFrom(service.create(item, context));
    const request = http.expectOne({ method: 'POST', url: '/api/appraiser' });
    expect(request.request.body).toEqual(item);
    expect(request.request.context.get(token)).toBe(true);
    request.flush(saved, { status: 201, statusText: 'Created' });
    await expect(result).resolves.toEqual(saved);
  });

  it('updates the requested appraiser', async () => {
    const result = firstValueFrom(service.save(item, 7, context));
    const request = http.expectOne({ method: 'PUT', url: '/api/appraiser/7' });
    expect(request.request.body).toEqual(item);
    expect(request.request.context.get(token)).toBe(true);
    request.flush(saved);
    await expect(result).resolves.toEqual(saved);
  });

  it('deletes the requested appraiser', async () => {
    const result = firstValueFrom(service.delete(7, context));
    const request = http.expectOne({
      method: 'DELETE',
      url: '/api/appraiser/7',
    });
    expect(request.request.context.get(token)).toBe(true);
    request.flush(null, { status: 204, statusText: 'No Content' });
    await expect(result).resolves.toBeNull();
  });
});
