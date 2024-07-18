import {NgModule} from '@angular/core';
import {ChecklistLibModule} from 'term-web/sys/_lib/checklist';
import {SpaceLibModule} from 'term-web/sys/_lib/space';
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
    SpaceLibModule
  ],
  exports: [
    JobLibModule,
    LorqueLibModule,
    ProvenanceLibModule,
    ReleaseLibModule,
    ChecklistLibModule,
    SpaceLibModule
  ]
})
export class SysLibModule {
}
