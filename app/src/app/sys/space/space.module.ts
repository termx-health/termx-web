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
import {ServerEditComponent} from 'term-web/sys/space/containers/server/server-edit.component';
import {ServerListComponent} from 'term-web/sys/space/containers/server/server-list.component';
import {ServerSummaryComponent} from 'term-web/sys/space/containers/server/server-summary.component';
import {ServerResourcesComponent} from 'term-web/sys/space/containers/server/server-resources.component';
import {ServerAuthoritativeEditComponent} from 'term-web/sys/space/containers/server/server-authoritative-edit.component';
import {PackageResourceService} from 'term-web/sys/space/services/package-resource.service';
import {PackageService} from 'term-web/sys/space/services/package.service';
import {SpaceService} from 'term-web/sys/space/services/space.service';
import {ServerService} from 'term-web/sys/space/services/server.service';

export const SPACE_CTX_ROUTES: Routes = [
  {path: '', component: SpaceDashboardComponent},
  {path: 'diff', component: SpaceDiffComponent},
  {path: 'diff-matrix', component: SpaceDiffMatrixComponent}
];

export const SPACE_ROUTES: Routes = [
  {path: '', component: SpaceListComponent},
  {path: 'add', data: {privilege: ['*.Space.write']}, component: SpaceEditComponent},
  {path: ':id/edit', data: {privilege: ['{id}.Space.write']}, component: SpaceEditComponent},
  {path: ':id/github', data: {privilege: ['{id}.Space.write']}, component: SpaceGithubComponent},
  {path: ':spaceId/packages/add', data: {privilege: ['{id}.Space.write']}, component: PackageEditComponent},
  {path: ':spaceId/packages/:id/edit', data: {privilege: ['{id}.Space.write']}, component: PackageEditComponent}
];

export const SERVER_ROUTES: Routes = [
  {path: '', component: ServerListComponent},
  {path: 'add', data: {privilege: ['*.Space.write']}, component: ServerEditComponent},
  {path: ':id/summary', data: {privilege: ['{id}.Space.read']}, component: ServerSummaryComponent},
  {path: ':id/details', data: {privilege: ['{id}.Space.read']}, component: ServerEditComponent},
  {path: ':id/edit', data: {privilege: ['{id}.Space.write']}, component: ServerEditComponent},
  {path: ':id/resources', data: {privilege: ['{id}.Space.read']}, component: ServerResourcesComponent},
  {path: ':id/authoritative/:type', data: {privilege: ['{id}.Space.write']}, component: ServerAuthoritativeEditComponent},
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
        ServerListComponent,
        ServerEditComponent
    ],
    providers: [
        SpaceService,
        SpaceGithubService,
        PackageService,
        PackageResourceService,
        ServerService
    ]
})
export class SpaceModule {
}
