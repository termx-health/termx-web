import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {TerminologyServiceApiComponent} from './containers/terminology-service-api.component';
import {CoreUiModule} from '../core/ui/core-ui.module';

export const TERMINOLOGY_SERVICE_API_ROUTES: Routes = [
  {path: '', component: TerminologyServiceApiComponent}
];

@NgModule({
  imports: [
    CoreUiModule
  ],
  declarations: [
    TerminologyServiceApiComponent
  ],
  providers: []
})
export class TerminologyServiceApiModule {
}
