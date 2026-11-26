
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Onboarding } from './onboarding';

describe('Onboarding', () => {
  let component: Onboarding;
  let fixture: ComponentFixture<Onboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Onboarding]
    }).compileComponents();

    fixture = TestBed.createComponent(Onboarding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Logo', () => {
    it('should render the logo component', () => {
      const logo = fixture.nativeElement.querySelector(
        '.onboarding-logo app-svg-loader'
      );

      expect(logo).toBeTruthy();
    });

    it('should not be hidden by CSS', () => {
      const logo = fixture.nativeElement.querySelector(
        '.onboarding-logo'
      );

      expect(logo).toBeTruthy();

      const styles = getComputedStyle(logo);

      expect(styles.display).not.toBe('none');
      expect(styles.visibility).not.toBe('hidden');
      expect(Number(styles.opacity)).toBeGreaterThan(0);
    });
  });
});
