import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodeSystemLibModule} from './codesystem';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    CodeSystemLibModule
  ],
  exports: [
    CodeSystemLibModule
  ]

})
export class TerminologyLibModule {
}


