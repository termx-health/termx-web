import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {FhirValueSetComponent} from './value-set/fhir-value-set.component';
import {FhirCodeSystemComponent} from './code-system/fhir-code-system.component';
import {FhirLibModule} from 'term-web/fhir/_lib';
import {FhirResourceComponent} from 'term-web/fhir/fhir-resource.component';
import {FhirConceptMapComponent} from 'term-web/fhir/concept-map/fhir-concept-map.component';

export const FHIR_ROUTES: Routes = [
  {path: ':type/:id', component: FhirResourceComponent},
  {path: ':type/:id/:operation', component: FhirResourceComponent}
];

@NgModule({
  imports: [
    CoreUiModule,
    FhirLibModule
  ],
  declarations: [
    FhirResourceComponent,
    FhirCodeSystemComponent,
    FhirValueSetComponent,
    FhirConceptMapComponent
  ],
})
export class FhirModule {
}
