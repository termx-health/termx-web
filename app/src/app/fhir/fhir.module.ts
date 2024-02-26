import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {FhirLibModule} from 'term-web/fhir/_lib';
import {FhirCodeSystemLookupComponent} from 'term-web/fhir/code-system/fhir-code-system-lookup.component';
import {FhirConceptMapComponent} from 'term-web/fhir/concept-map/fhir-concept-map.component';
import {FhirResourceComponent} from 'term-web/fhir/fhir-resource.component';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {FhirCodeSystemComponent} from './code-system/fhir-code-system.component';
import {FhirValueSetComponent} from './value-set/fhir-value-set.component';

export const FHIR_ROUTES: Routes = [
  {path: ':type', component: FhirResourceComponent},
  {path: ':type/:id', component: FhirResourceComponent},
  {path: ':type/:id/:operation', component: FhirResourceComponent}
];

@NgModule({
  imports: [
    CoreUiModule,
    FhirLibModule,
    WikiLibModule
  ],
  declarations: [
    FhirResourceComponent,
    FhirCodeSystemComponent,
    FhirCodeSystemLookupComponent,
    FhirValueSetComponent,
    FhirConceptMapComponent
  ],
})
export class FhirModule {
}
