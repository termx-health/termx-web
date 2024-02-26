import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {TerminologyServiceApiComponent} from './containers/terminology-service-api.component';

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
