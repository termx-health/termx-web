import {NgModule} from '@angular/core';
import {CodeSystemLibModule} from './codesystem';
import {ConceptLibModule} from './concept';
import {DesignationLibModule} from './designation';
import {ValueSetLibModule} from './valueset';

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
export class ResourcesLibModule {
}


