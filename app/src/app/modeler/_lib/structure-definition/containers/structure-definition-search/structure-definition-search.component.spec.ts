import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureDefinitionSearchComponent } from './structure-definition-search.component';

describe('StructureDefinitionSearchComponent', () => {
  let component: StructureDefinitionSearchComponent;
  let fixture: ComponentFixture<StructureDefinitionSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StructureDefinitionSearchComponent]
    });
    fixture = TestBed.createComponent(StructureDefinitionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
