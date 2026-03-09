import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {TerminologyServiceApiComponent} from 'term-web/terminology-service-api/containers/terminology-service-api.component';

export const TERMINOLOGY_SERVICE_API_ROUTES: Routes = [
  {path: '', component: TerminologyServiceApiComponent}
];

@NgModule({
    imports: [
        CoreUiModule,
        TerminologyServiceApiComponent
    ],
    providers: []
})
export class TerminologyServiceApiModule {
}
