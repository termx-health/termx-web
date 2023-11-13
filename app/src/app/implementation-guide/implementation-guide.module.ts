import {NgModule} from '@angular/core';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ImplementationGuideService} from './services/implementation-guide.service';
import {Routes} from '@angular/router';
import {ImplementationGuideLibModule} from './_lib';
import {ImplementationGuideListComponent} from 'term-web/implementation-guide/container/list/implementation-guide-list.component';
import {ImplementationGuideEditComponent} from 'term-web/implementation-guide/container/edit/implementation-guide-edit.component';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {ImplementationGuideVersionFormComponent} from 'term-web/implementation-guide/container/version/implementation-guide-version-form.component';
import {ValueSetLibModule} from 'term-web/resources/_lib';
import {ImplementationGuideSummaryComponent} from 'term-web/implementation-guide/container/summary/implementation-guide-summary.component';

const EDIT = {privilege: ['{id}.ImplementationGuide.edit']};
const VIEW = {privilege: ['{id}.ImplementationGuide.view']};

export const IG_ROUTES: Routes = [
  {path: '', component: ImplementationGuideListComponent},
  {path: 'add', component: ImplementationGuideEditComponent, data: {privilege: ['*.ImplementationGuide.edit']}},
  {path: ':id/edit', component: ImplementationGuideEditComponent, data: EDIT},
  {path: ':id/summary', component: ImplementationGuideSummaryComponent, data: VIEW},

];

@NgModule({
  declarations: [
    ImplementationGuideListComponent,
    ImplementationGuideEditComponent,
    ImplementationGuideVersionFormComponent,
    ImplementationGuideSummaryComponent
  ],
  imports: [
    CoreUiModule,
    ImplementationGuideLibModule,
    ResourceModule,
    ValueSetLibModule
  ],
  providers: [
    ImplementationGuideService
  ]
})
export class ImplementationGuideModule {
}
