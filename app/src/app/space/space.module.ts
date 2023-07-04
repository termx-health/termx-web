import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {SpaceListComponent} from './containers/space/space-list.component';
import {SpaceEditComponent} from './containers/space/space-edit.component';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {SpaceService} from './services/space.service';
import {PackageEditComponent} from './containers/package/package-edit.component';
import {SpaceDashboardComponent} from './containers/space/space-dashboard.component';
import {SpaceDiffComponent} from './containers/space/space-diff.component';
import {TerminologyServerListComponent} from './containers/terminology-server/terminology-server-list.component';
import {TerminologyServerEditComponent} from './containers/terminology-server/terminology-server-edit.component';
import {TerminologyServerService} from './services/terminology-server.service';
import {PackageService} from './services/package.service';
import {PackageVersionService} from './services/package-version.service';
import {PackageResourceService} from './services/package-resource.service';
import {SpaceDiffMatrixComponent} from './containers/space/space-diff-matrix.component';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, NamingSystemLibModule, ValueSetLibModule} from '../resources/_lib';
import {SpaceLibModule} from 'term-web/space/_lib';

export const SPACE_CTX_ROUTES: Routes = [
  {path: '', component: SpaceDashboardComponent},
  {path: 'diff', component: SpaceDiffComponent},
  {path: 'diff-matrix', component: SpaceDiffMatrixComponent}
];

export const SPACE_ROUTES: Routes = [
  {path: '', component: SpaceListComponent},
  {path: 'add', data: {privilege: ['*.Space.edit']}, component: SpaceEditComponent},
  {path: ':id/edit', data: {privilege: ['*.Space.edit']}, component: SpaceEditComponent},
  {path: ':spaceId/packages/add', data: {privilege: ['*.Space.edit']}, component: PackageEditComponent},
  {path: ':spaceId/packages/:id/edit', data: {privilege: ['*.Space.edit']}, component: PackageEditComponent}
];

export const TERMINOLOGY_SERVER_ROUTES: Routes = [
  {path: '', component: TerminologyServerListComponent},
  {path: 'add', data: {privilege: ['*.Space.edit']}, component: TerminologyServerEditComponent},
  {path: ':id/edit', data: {privilege: ['*.Space.edit']}, component: TerminologyServerEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
    CodeSystemLibModule,
    ValueSetLibModule,
    MapSetLibModule,
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

    PackageEditComponent,

    TerminologyServerListComponent,
    TerminologyServerEditComponent
  ],
  providers: [
    SpaceService,
    PackageService,
    PackageVersionService,
    PackageResourceService,
    TerminologyServerService
  ]
})
export class SpaceModule {
}