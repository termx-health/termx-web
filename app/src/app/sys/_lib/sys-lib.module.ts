import {NgModule} from '@angular/core';
import {ChecklistLibModule} from 'term-web/sys/_lib/checklist';
import {JobLibModule} from './job';
import {LorqueLibModule} from './lorque';
import {ProvenanceLibModule} from './provenance';
import {ReleaseLibModule} from './release';

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
