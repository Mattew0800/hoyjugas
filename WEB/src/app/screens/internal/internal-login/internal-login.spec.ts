import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalLogin } from './internal-login';

describe('InternalLogin', () => {
  let component: InternalLogin;
  let fixture: ComponentFixture<InternalLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
