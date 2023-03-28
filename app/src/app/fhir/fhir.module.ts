import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SharedModule} from '../core/shared/shared.module';
import {FhirValueSetComponent} from './value-set/fhir-value-set.component';
import {FhirCodeSystemComponent} from './code-system/fhir-code-system.component';
import {FhirLibModule} from 'term-web/fhir/_lib';

export const FHIR_ROUTES: Routes = [
  {path: 'CodeSystem/:id', component: FhirCodeSystemComponent},
  {path: 'ValueSet/:id', component: FhirValueSetComponent}
];

@NgModule({
  imports: [
    SharedModule,
    FhirLibModule
  ],
  declarations: [
    FhirCodeSystemComponent,
    FhirValueSetComponent
  ],
})
export class FhirModule {
}
