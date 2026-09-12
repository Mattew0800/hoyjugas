import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConfig } from './system-config';

describe('SystemConfig', () => {
  let component: SystemConfig;
  let fixture: ComponentFixture<SystemConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
