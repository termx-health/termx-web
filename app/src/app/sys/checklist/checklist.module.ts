import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {AssociationLibModule, CodeSystemLibModule, MapSetLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {CodeSystemModule} from 'term-web/resources/code-system/code-system.module';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {ProvenanceLibModule} from 'term-web/sys/_lib';
import {ChecklistRuleEditComponent} from 'term-web/sys/checklist/containers/checklist-rule-edit.component';
import {ChecklistRuleListComponent} from 'term-web/sys/checklist/containers/checklist-rule-list.component';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';
import {CoreUiModule} from '../../core/ui/core-ui.module';

export const CHECKLIST_ROUTES: Routes = [
  {path: '', data: {privilege: ['*.Checklist.view']}, component: ChecklistRuleListComponent},
  {path: 'add', data: {privilege: ['*.Checklist.edit']}, component: ChecklistRuleEditComponent},
  {path: ':id/edit', data: {privilege: ['{id}.Checklist.edit']}, component: ChecklistRuleEditComponent},
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
    ChecklistRuleListComponent, ChecklistRuleEditComponent,
  ],
  providers: [
    ChecklistService
  ],
  exports: []
})
export class ChecklistModule {
}
