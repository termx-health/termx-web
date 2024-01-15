import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {Routes} from '@angular/router';
import {ReleaseService} from './services/release.service';
import {ReleaseEditComponent} from 'term-web/sys/release/containers/release-edit.component';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {CodeSystemModule} from 'term-web/resources/code-system/code-system.module';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {ReleaseListComponent} from 'term-web/sys/release/containers/release-list.component';
import {ReleaseSummaryComponent} from 'term-web/sys/release/containers/release-summary.component';
import {ReleaseProvenancesComponent} from 'term-web/sys/release/containers/release-provenances.component';
import {ProvenanceLibModule} from 'term-web/sys/_lib';
import {ModelerLibModule} from 'term-web/modeler/_lib';

export const RELEASE_ROUTES: Routes = [
  {path: '', data: {privilege: ['*.Release.view']}, component: ReleaseListComponent},
  {path: 'add', data: {privilege: ['*.Release.edit']}, component: ReleaseEditComponent},
  {path: ':id/edit', data: {privilege: ['{id}.Release.edit']}, component: ReleaseEditComponent},
  {path: ':id/summary', data: {privilege: ['{id}.Release.view']}, component: ReleaseSummaryComponent},
  {path: ':id/provenances', data: {privilege: ['{id}.Release.view']}, component: ReleaseProvenancesComponent},
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
    ModelerLibModule
  ],
  declarations: [
    ReleaseListComponent,
    ReleaseEditComponent,
    ReleaseSummaryComponent,
    ReleaseProvenancesComponent
  ],
  providers: [
    ReleaseService
  ],
  exports: []
})
export class ReleaseModule {
}
