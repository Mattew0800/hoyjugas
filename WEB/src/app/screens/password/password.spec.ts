import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Password } from './password';

describe('Password', () => {
  let component: Password;
  let fixture: ComponentFixture<Password>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Password]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Password);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
