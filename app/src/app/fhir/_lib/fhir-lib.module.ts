import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FhirCodeSystemLibService} from './code-system';
import {FhirConceptMapLibService} from './concept-map';
import {FhirValueSetLibService} from './value-set';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    FhirCodeSystemLibService,
    FhirValueSetLibService,
    FhirConceptMapLibService
  ]
})
export class FhirLibModule {
}
