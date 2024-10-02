import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransformationDefinitionSearchComponent } from './transformation-definition-search.component';

describe('TransformationDefinitionSearchComponent', () => {
  let component: TransformationDefinitionSearchComponent;
  let fixture: ComponentFixture<TransformationDefinitionSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransformationDefinitionSearchComponent]
    });
    fixture = TestBed.createComponent(TransformationDefinitionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
