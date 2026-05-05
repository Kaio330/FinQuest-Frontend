import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefautLoginLayout } from './defaut-login-layout';

describe('DefautLoginLayout', () => {
  let component: DefautLoginLayout;
  let fixture: ComponentFixture<DefautLoginLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefautLoginLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(DefautLoginLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
