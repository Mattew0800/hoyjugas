import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConfigScreen } from './system-config';

describe('SystemConfig', () => {
  let component: SystemConfigScreen;
  let fixture: ComponentFixture<SystemConfigScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemConfigScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemConfigScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
