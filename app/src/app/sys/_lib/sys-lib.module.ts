import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JobLibService} from './services/job-lib.service';
import {LorqueLibService} from './services/lorque-lib.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    JobLibService,
    LorqueLibService
  ]
})
export class SysLibModule {
}
