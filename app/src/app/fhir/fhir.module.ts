import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SharedModule} from '../core/shared/shared.module';
import {FhirValueSetComponent} from './valueset/fhir-value-set.component';
import {FhirLibModule} from 'terminology-lib/fhir';
import {FhirCodeSystemComponent} from './codesystem/fhir-code-system.component';

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
