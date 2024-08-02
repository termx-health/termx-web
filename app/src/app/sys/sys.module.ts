import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CHECKLIST_ROUTES, ChecklistModule} from 'term-web/sys/checklist/checklist.module';
import {RELEASE_ROUTES, ReleaseModule} from 'term-web/sys/release/release.module';
import {SpaceModule} from 'term-web/sys/space/space.module';

export const SYS_ROUTES: Routes = [
  {path: 'releases', children: RELEASE_ROUTES, data: {privilege: ['*.Release.view']}},
  {path: 'checklists', children: CHECKLIST_ROUTES, data: {privilege: ['*.Checklist.view']}},
];

@NgModule({
  imports: [
    ReleaseModule,
    ChecklistModule,
    SpaceModule
  ]
})
export class SysModule {}
