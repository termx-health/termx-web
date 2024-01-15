import {NgModule} from '@angular/core';
import {ReleaseLibModule} from './release';
import {JobLibModule} from './job';
import {LorqueLibModule} from './lorque';
import {ProvenanceLibModule} from './provenance';
import {ChecklistLibModule} from 'term-web/sys/_lib/checklist';

@NgModule({
  imports: [
    JobLibModule,
    LorqueLibModule,
    ProvenanceLibModule,
    ReleaseLibModule,
    ChecklistLibModule,
  ],
  exports: [
    JobLibModule,
    LorqueLibModule,
    ProvenanceLibModule,
    ReleaseLibModule,
    ChecklistLibModule,
  ]
})
export class SysLibModule {
}
