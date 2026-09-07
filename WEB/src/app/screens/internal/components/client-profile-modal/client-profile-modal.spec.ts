import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProfileModal } from './client-profile-modal';

describe('ClientProfileModal', () => {
  let component: ClientProfileModal;
  let fixture: ComponentFixture<ClientProfileModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProfileModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProfileModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
