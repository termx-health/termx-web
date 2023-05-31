import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ProjectListComponent} from './containers/project/project-list.component';
import {ProjectEditComponent} from './containers/project/project-edit.component';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ProjectService} from './services/project.service';
import {PackageEditComponent} from './containers/package/package-edit.component';
import {ProjectDashboardComponent} from './containers/project/project-dashboard.component';
import {ProjectDiffComponent} from './containers/project/project-diff.component';
import {TerminologyServerListComponent} from './containers/terminology-server/terminology-server-list.component';
import {TerminologyServerEditComponent} from './containers/terminology-server/terminology-server-edit.component';
import {TerminologyServerService} from './services/terminology-server.service';
import {PackageService} from './services/package.service';
import {PackageVersionService} from './services/package-version.service';
import {PackageResourceService} from './services/package-resource.service';
import {ProjectDiffMatrixComponent} from './containers/project/project-diff-matrix.component';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from '../resources/_lib';
import {ProjectLibModule} from 'term-web/project/_lib';

export const PROJECT_CTX_ROUTES: Routes = [
  {path: '', component: ProjectDashboardComponent},
  {path: 'diff', component: ProjectDiffComponent},
  {path: 'diff-matrix', component: ProjectDiffMatrixComponent}
];

export const PROJECT_ROUTES: Routes = [
  {path: '', component: ProjectListComponent},
  {path: 'add', component: ProjectEditComponent},
  {path: ':id/edit', component: ProjectEditComponent},
  {path: ':projectId/packages/add', component: PackageEditComponent},
  {path: ':projectId/packages/:id/edit', component: PackageEditComponent}
];

export const TERMINOLOGY_SERVER_ROUTES: Routes = [
  {path: '', component: TerminologyServerListComponent},
  {path: 'add', component: TerminologyServerEditComponent},
  {path: ':id/edit', component: TerminologyServerEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
    CodeSystemLibModule,
    ValueSetLibModule,
    MapSetLibModule,
    NamingSystemLibModule,
    AssociationLibModule,

    ProjectLibModule
  ],
  declarations: [
    ProjectDashboardComponent,
    ProjectListComponent,
    ProjectEditComponent,
    ProjectDiffComponent,
    ProjectDiffMatrixComponent,

    PackageEditComponent,

    TerminologyServerListComponent,
    TerminologyServerEditComponent
  ],
  providers: [
    ProjectService,
    PackageService,
    PackageVersionService,
    PackageResourceService,
    TerminologyServerService
  ]
})
export class ProjectModule {
}
