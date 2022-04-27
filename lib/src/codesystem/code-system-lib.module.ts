import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodeSystemLibService} from './services/code-system-lib.service';


@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    CodeSystemLibService
  ]
})
export class CodeSystemLibModule {
}
