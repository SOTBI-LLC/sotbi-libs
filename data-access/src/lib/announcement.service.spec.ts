import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Announcement } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { AnnouncementService } from './announcement.service';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let http: jest.Mocked<HttpClient>;

  const mockAnnouncements: Announcement[] = [
    {
      id: 1,
      new: false,
      title: 'A1',
      content: 'C1',
      creator_id: 1,
      start: new Date('2024-01-01T00:00:00Z'),
      end: new Date('2024-12-31T23:59:59Z'),
      author_id: 10,
    },
    {
      id: 2,
      new: false,
      title: 'A2',
      content: 'C2',
      creator_id: 2,
      start: new Date('2024-02-01T00:00:00Z'),
      end: new Date('2024-11-30T23:59:59Z'),
      author_id: 11,
    },
  ];

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpSpy },
        AnnouncementService,
      ],
    }).compileComponents();

    service = TestBed.inject(AnnouncementService);
    http = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path', () => {
    expect(service.path).toBe('/api/announcement');
  });

  describe('getAllWithCondition', () => {
    it('should call GET /api/announcements with no params by default', () => {
      http.get.mockReturnValue(of(mockAnnouncements));

      service.getAllWithCondition().subscribe((res) => {
        expect(res).toEqual(mockAnnouncements);
      });

      expect(http.get).toHaveBeenCalledWith('/api/announcements', {
        params: new HttpParams(),
      });
    });

    it('should set all=1 when all=true', () => {
      http.get.mockReturnValue(of(mockAnnouncements));

      service.getAllWithCondition(true).subscribe();

      const expected = new HttpParams().set('all', '1');
      expect(http.get).toHaveBeenCalledWith('/api/announcements', {
        params: expected,
      });
    });

    it('should set show_planned=1 when show_planned=true', () => {
      http.get.mockReturnValue(of(mockAnnouncements));

      service.getAllWithCondition(false, true).subscribe();

      const expected = new HttpParams().set('show_planned', '1');
      expect(http.get).toHaveBeenCalledWith('/api/announcements', {
        params: expected,
      });
    });

    it('should set omit_img=1 when omit_img=true', () => {
      http.get.mockReturnValue(of(mockAnnouncements));

      service.getAllWithCondition(false, false, true).subscribe();

      const expected = new HttpParams().set('omit_img', '1');
      expect(http.get).toHaveBeenCalledWith('/api/announcements', {
        params: expected,
      });
    });

    it('should combine params when multiple flags are true', () => {
      http.get.mockReturnValue(of(mockAnnouncements));

      service.getAllWithCondition(true, true, true).subscribe();

      const expected = new HttpParams()
        .set('all', '1')
        .set('show_planned', '1')
        .set('omit_img', '1');
      expect(http.get).toHaveBeenCalledWith('/api/announcements', {
        params: expected,
      });
    });

    it('should propagate HTTP errors', (done) => {
      const err = new Error('Fetch failed');
      http.get.mockReturnValue(throwError(() => err));

      service.getAllWithCondition().subscribe({
        next: () => {
          fail('Should have errored');
          done();
        },
        error: (e) => {
          expect(e).toBe(err);
          done();
        },
      });
    });
  });

  describe('inherited CRUD', () => {
    it('get should call GET /api/announcement/:id', () => {
      http.get.mockReturnValue(of(mockAnnouncements[0]));

      service.get(1).subscribe((res) => {
        expect(res).toEqual(mockAnnouncements[0]);
      });

      expect(http.get).toHaveBeenCalledWith('/api/announcement/1');
    });

    it('add should call POST /api/announcement', () => {
      const payload: Partial<Announcement> = {
        title: 'New',
        content: 'C',
        creator_id: 1,
        start: new Date(),
        end: new Date(),
        author_id: 2,
      };
      const created = { ...payload, id: 100 } as Announcement;
      http.post.mockReturnValue(of(created));

      service.add(payload).subscribe((res) => {
        expect(res).toEqual(created);
      });

      expect(http.post).toHaveBeenCalledWith('/api/announcement', payload);
    });

    it('update should call PUT /api/announcement/:id with body without id', () => {
      const updatePayload: Announcement = {
        id: 1,
        title: 'U',
        new: false,
        content: null,
        creator_id: 0,
        start: null,
        end: null,
        author_id: 0,
      };
      const updated = { ...mockAnnouncements[0], title: 'U' } as Announcement;
      http.put.mockReturnValue(of(updated));

      service.update(updatePayload).subscribe((res) => {
        expect(res).toEqual(updated);
      });

      expect(http.put).toHaveBeenCalledWith(
        '/api/announcement/1',
        expect.objectContaining({
          title: 'U',
        }),
      );
    });

    it('delete should call DELETE /api/announcement/:id', () => {
      http.delete.mockReturnValue(of(undefined));

      service.delete(5).subscribe((res) => {
        expect(res).toBeUndefined();
      });

      expect(http.delete).toHaveBeenCalledWith('/api/announcement/5');
    });
  });
});
