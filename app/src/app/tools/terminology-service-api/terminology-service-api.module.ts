import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {TerminologyServiceApiComponent} from './containers/terminology-service-api.component';
import {SharedModule} from '../../core/shared/shared.module';

export const TERMINOLOGY_SERVICE_API_ROUTES: Routes = [
  {path: '', component: TerminologyServiceApiComponent}
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    TerminologyServiceApiComponent
  ],
  providers: []
})
export class TerminologyServiceApiModule {
}
