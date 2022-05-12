import {NgModule} from '@angular/core';
import {CodeSystemLibModule} from './codesystem';
import {ConceptLibModule} from './concept/concept-lib.module';
import {DesignationLibModule} from './designation/designation-lib.module';
import {ValueSetLibModule} from './valueset/value-set-lib.module';

@NgModule({
  declarations: [],
  imports: [
    CodeSystemLibModule,
    ConceptLibModule,
    DesignationLibModule,
    ValueSetLibModule
  ],
  exports: [
    CodeSystemLibModule,
    ConceptLibModule,
    DesignationLibModule,
    ValueSetLibModule
  ]
})
export class TerminologyLibModule {
}


