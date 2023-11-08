import {NgModule} from '@angular/core';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ImplementationGuideService} from './services/implementation-guide.service';
import {Routes} from '@angular/router';
import {ImplementationGuideLibModule} from './_lib';
import {ImplementationGuideListComponent} from 'term-web/implementation-guide/container/implementation-guide-list.component';


export const IG_ROUTES: Routes = [
  {path: '', component: ImplementationGuideListComponent},
];

@NgModule({
  declarations: [
    ImplementationGuideListComponent
  ],
  imports: [
    CoreUiModule,
    ImplementationGuideLibModule
  ],
  providers: [
    ImplementationGuideService
  ]
})
export class ImplementationGuideModule {
}
