import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ImplementationGuideEditComponent} from 'term-web/implementation-guide/container/edit/implementation-guide-edit.component';
import {ImplementationguideGithubComponent} from 'term-web/implementation-guide/container/github/implementationguide-github.component';
import {ImplementationGuideListComponent} from 'term-web/implementation-guide/container/list/implementation-guide-list.component';
import {ImplementationGuideProvenancesComponent} from 'term-web/implementation-guide/container/provenance/implementation-guide-provenances.component';
import {ImplementationGuideSummaryComponent} from 'term-web/implementation-guide/container/summary/implementation-guide-summary.component';
import {ImplementationGuideInfoWidgetComponent} from 'term-web/implementation-guide/container/summary/widgets/implementation-guide-info-widget.component';
import {
  ImplementationGuideVersionsWidgetComponent
} from 'term-web/implementation-guide/container/summary/widgets/implementation-guide-versions-widget.component';
import {ImplementationGuideVersionEditComponent} from 'term-web/implementation-guide/container/version/edit/implementation-guide-version-edit.component';
import {ImplementationGuideVersionFormComponent} from 'term-web/implementation-guide/container/version/edit/implementation-guide-version-form.component';
import {
  ImplementationGuideVersionSummaryComponent
} from 'term-web/implementation-guide/container/version/summary/implementation-guide-version-summary.component';
import {ImplementationGuideGroupListComponent} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-group-list.component';
import {ImplementationGuidePageListComponent} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-page-list.component';
import {
  ImplementationGuideResourceListComponent
} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-resource-list.component';
import {
  ImplementationGuideVersionInfoWidgetComponent
} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-version-info-widget.component';
import {ImplementationGuideGithubService} from 'term-web/implementation-guide/services/implementation-guide-github.service';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {CodeSystemLibModule, MapSetLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {SpaceLibModule} from 'term-web/space/_lib';
import {SysLibModule} from 'term-web/sys/_lib';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ImplementationGuideLibModule} from './_lib';
import {ImplementationGuideService} from './services/implementation-guide.service';

const EDIT = {privilege: ['{id}.ImplementationGuide.edit']};
const VIEW = {privilege: ['{id}.ImplementationGuide.view']};

export const IG_ROUTES: Routes = [
  {path: '', component: ImplementationGuideListComponent},
  {path: 'add', component: ImplementationGuideEditComponent, data: {privilege: ['*.ImplementationGuide.edit']}},
  {path: ':id/edit', component: ImplementationGuideEditComponent, data: EDIT},
  {path: ':id/summary', component: ImplementationGuideSummaryComponent, data: VIEW},
  {path: ':id/provenances', component: ImplementationGuideProvenancesComponent, data: VIEW},

  {path: ':id/versions/add', component: ImplementationGuideVersionEditComponent, data: EDIT},
  {path: ':id/versions/:versionCode/summary', component: ImplementationGuideVersionSummaryComponent, data: VIEW},
  {path: ':id/versions/:versionCode/edit', component: ImplementationGuideVersionEditComponent, data: EDIT},
  {path: ':id/versions/:versionCode/provenances', component: ImplementationGuideProvenancesComponent, data: VIEW},
  {path: ':id/versions/:versionCode/github', component: ImplementationguideGithubComponent, data: EDIT}
];

@NgModule({
  declarations: [
    ImplementationGuideListComponent,
    ImplementationGuideEditComponent,
    ImplementationGuideVersionFormComponent,
    ImplementationGuideProvenancesComponent,
    ImplementationGuideSummaryComponent,
    ImplementationGuideVersionsWidgetComponent,
    ImplementationGuideInfoWidgetComponent,
    ImplementationGuideVersionEditComponent,
    ImplementationGuideVersionSummaryComponent,
    ImplementationGuideVersionInfoWidgetComponent,
    ImplementationGuideGroupListComponent,
    ImplementationGuideResourceListComponent,
    ImplementationGuidePageListComponent,
    ImplementationguideGithubComponent
  ],
  imports: [
    CoreUiModule,
    ImplementationGuideLibModule,
    ResourceModule,
    ValueSetLibModule,
    CodeSystemLibModule,
    SysLibModule,
    MapSetLibModule,
    ModelerLibModule,
    SpaceLibModule,
    WikiLibModule
  ],
  providers: [
    ImplementationGuideService,
    ImplementationGuideGithubService
  ]
})
export class ImplementationGuideModule {
}
