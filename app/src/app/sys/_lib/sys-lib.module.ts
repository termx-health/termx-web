import {NgModule} from '@angular/core';
import {ChecklistLibModule} from 'term-web/sys/_lib/checklist';
import {SpaceLibModule} from 'term-web/sys/_lib/space';
import {JobLibModule} from 'term-web/sys/_lib/job';
import {LorqueLibModule} from 'term-web/sys/_lib/lorque';
import {ProvenanceLibModule} from 'term-web/sys/_lib/provenance';
import {ReleaseLibModule} from 'term-web/sys/_lib/release';

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
