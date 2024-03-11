import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SpaceLibModule} from 'term-web/space/_lib';
import {SpaceGithubComponent} from 'term-web/space/containers/space/space-github.component';
import {SpaceGithubService} from 'term-web/space/services/space-github.service';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from '../resources/_lib';
import {PackageEditComponent} from './containers/package/package-edit.component';
import {SpaceDashboardComponent} from './containers/space/space-dashboard.component';
import {SpaceDiffMatrixComponent} from './containers/space/space-diff-matrix.component';
import {SpaceDiffComponent} from './containers/space/space-diff.component';
import {SpaceEditComponent} from './containers/space/space-edit.component';
import {SpaceListComponent} from './containers/space/space-list.component';
import {TerminologyServerEditComponent} from './containers/terminology-server/terminology-server-edit.component';
import {TerminologyServerListComponent} from './containers/terminology-server/terminology-server-list.component';
import {PackageResourceService} from './services/package-resource.service';
import {PackageService} from './services/package.service';
import {SpaceService} from './services/space.service';
import {TerminologyServerService} from './services/terminology-server.service';

export const SPACE_CTX_ROUTES: Routes = [
  {path: '', component: SpaceDashboardComponent},
  {path: 'diff', component: SpaceDiffComponent},
  {path: 'diff-matrix', component: SpaceDiffMatrixComponent}
];

export const SPACE_ROUTES: Routes = [
  {path: '', component: SpaceListComponent},
  {path: 'add', data: {privilege: ['*.Space.edit']}, component: SpaceEditComponent},
  {path: ':id/edit', data: {privilege: ['{id}.Space.edit']}, component: SpaceEditComponent},
  {path: ':id/github', data: {privilege: ['{id}.Space.edit']}, component: SpaceGithubComponent},
  {path: ':spaceId/packages/add', data: {privilege: ['{id}.Space.edit']}, component: PackageEditComponent},
  {path: ':spaceId/packages/:id/edit', data: {privilege: ['{id}.Space.edit']}, component: PackageEditComponent}
];

export const TERMINOLOGY_SERVER_ROUTES: Routes = [
  {path: '', component: TerminologyServerListComponent},
  {path: 'add', data: {privilege: ['*.Space.edit']}, component: TerminologyServerEditComponent},
  {path: ':id/edit', data: {privilege: ['{id}.Space.edit']}, component: TerminologyServerEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
    CodeSystemLibModule,
    ValueSetLibModule,
    MapSetLibModule,
    WikiLibModule,
    NamingSystemLibModule,
    AssociationLibModule,

    SpaceLibModule
  ],
  declarations: [
    SpaceDashboardComponent,
    SpaceListComponent,
    SpaceEditComponent,
    SpaceDiffComponent,
    SpaceDiffMatrixComponent,
    SpaceGithubComponent,

    PackageEditComponent,

    TerminologyServerListComponent,
    TerminologyServerEditComponent
  ],
  providers: [
    SpaceService,
    SpaceGithubService,
    PackageService,
    PackageResourceService,
    TerminologyServerService
  ]
})
export class SpaceModule {
}
