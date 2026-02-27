import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FhirCodeSystemLibService} from 'term-web/fhir/_lib/code-system';
import {FhirConceptMapLibService} from 'term-web/fhir/_lib/concept-map';
import {FhirValueSetLibService} from 'term-web/fhir/_lib/value-set';

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
