import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { TimeEditComponent } from './time-edit.component';

describe('TimeEdit', () => {
  let component: TimeEditComponent;
  let fixture: ComponentFixture<TimeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
