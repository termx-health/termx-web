import {NgModule} from '@angular/core';
import {RELEASE_ROUTES, ReleaseModule} from 'term-web/sys/release/release.module';
import {Routes} from '@angular/router';
import {CHECKLIST_ROUTES, ChecklistModule} from 'term-web/sys/checklist/checklist.module';

export const SYS_ROUTES: Routes = [
  {path: 'releases', children: RELEASE_ROUTES, data: {privilege: ['*.Release.view']}},
  {path: 'checklists', children: CHECKLIST_ROUTES, data: {privilege: ['*.ChecklistRule.view']}},
];

@NgModule({
  imports: [
    ReleaseModule,
    ChecklistModule
  ]
})
export class SysModule {}
