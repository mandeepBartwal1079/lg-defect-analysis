import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectCard } from './defect-card';

describe('DefectCard', () => {
  let component: DefectCard;
  let fixture: ComponentFixture<DefectCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefectCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
