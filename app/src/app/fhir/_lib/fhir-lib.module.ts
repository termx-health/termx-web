import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FhirCodeSystemLibService} from './code-system';
import {FhirValueSetLibService} from './value-set';
import {FhirConceptMapLibService} from './concept-map';

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
