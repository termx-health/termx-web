import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SpaceLibModule} from 'term-web/sys/_lib/space';
import {SpaceGithubComponent} from 'term-web/sys/space/containers/space/space-github.component';
import {SpaceGithubService} from 'term-web/sys/space/services/space-github.service';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {PackageEditComponent} from 'term-web/sys/space/containers/package/package-edit.component';
import {SpaceDashboardComponent} from 'term-web/sys/space/containers/space/space-dashboard.component';
import {SpaceDiffMatrixComponent} from 'term-web/sys/space/containers/space/space-diff-matrix.component';
import {SpaceDiffComponent} from 'term-web/sys/space/containers/space/space-diff.component';
import {SpaceEditComponent} from 'term-web/sys/space/containers/space/space-edit.component';
import {SpaceListComponent} from 'term-web/sys/space/containers/space/space-list.component';
import {TerminologyServerEditComponent} from 'term-web/sys/space/containers/terminology-server/terminology-server-edit.component';
import {TerminologyServerListComponent} from 'term-web/sys/space/containers/terminology-server/terminology-server-list.component';
import {PackageResourceService} from 'term-web/sys/space/services/package-resource.service';
import {PackageService} from 'term-web/sys/space/services/package.service';
import {SpaceService} from 'term-web/sys/space/services/space.service';
import {TerminologyServerService} from 'term-web/sys/space/services/terminology-server.service';

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
        SpaceLibModule,
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
