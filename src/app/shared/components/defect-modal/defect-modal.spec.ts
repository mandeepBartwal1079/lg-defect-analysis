import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectModal } from './defect-modal';

describe('DefectModal', () => {
  let component: DefectModal;
  let fixture: ComponentFixture<DefectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefectModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
