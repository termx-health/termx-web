import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {CodeSystemModule} from 'term-web/resources/code-system/code-system.module';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {ProvenanceLibModule} from 'term-web/sys/_lib';
import {ReleaseEditComponent} from 'term-web/sys/release/containers/release-edit.component';
import {ReleaseListComponent} from 'term-web/sys/release/containers/release-list.component';
import {ReleaseProvenancesComponent} from 'term-web/sys/release/containers/release-provenances.component';
import {ReleaseResourceDiffComponent} from 'term-web/sys/release/containers/release-resource-diff.component';
import {ReleaseSummaryComponent} from 'term-web/sys/release/containers/release-summary.component';
import {TaskLibModule} from 'term-web/task/_lib';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ReleaseService} from './services/release.service';

export const RELEASE_ROUTES: Routes = [
  {path: '', data: {privilege: ['*.Release.view']}, component: ReleaseListComponent},
  {path: 'add', data: {privilege: ['*.Release.edit']}, component: ReleaseEditComponent},
  {path: ':id/edit', data: {privilege: ['{id}.Release.edit']}, component: ReleaseEditComponent},
  {path: ':id/summary', data: {privilege: ['{id}.Release.view']}, component: ReleaseSummaryComponent},
  {path: ':id/provenances', data: {privilege: ['{id}.Release.view']}, component: ReleaseProvenancesComponent},
  {path: ':id/diff', data: {privilege: ['{id}.Release.view']}, component: ReleaseResourceDiffComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
    AssociationLibModule,
    CodeSystemLibModule,
    CodeSystemModule,
    ResourceModule,
    SequenceLibModule,
    ValueSetLibModule,
    ProvenanceLibModule,
    MapSetLibModule,
    ModelerLibModule,
    TaskLibModule,
    WikiLibModule
  ],
  declarations: [
    ReleaseListComponent,
    ReleaseEditComponent,
    ReleaseSummaryComponent,
    ReleaseProvenancesComponent,
    ReleaseResourceDiffComponent
  ],
  providers: [
    ReleaseService
  ],
  exports: []
})
export class ReleaseModule {
}
