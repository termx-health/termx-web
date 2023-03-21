import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JobLibService} from './services/job-lib-service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    JobLibService
  ]
})
export class JobLibModule {
}