import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources/resources-lib.module';

@NgModule({
  imports: [
    ResourcesLibModule
  ],
  exports: [
    ResourcesLibModule
  ]
})
export class TerminologyLibModule {
}


