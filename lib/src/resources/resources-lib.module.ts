import {NgModule} from '@angular/core';
import {CodeSystemLibModule} from './codesystem';
import {ConceptLibModule} from './concept';
import {DesignationLibModule} from './designation';
import {ValueSetLibModule} from './valueset';
import {MapSetLibModule} from './mapset';

@NgModule({
  declarations: [],
  imports: [
    CodeSystemLibModule,
    MapSetLibModule,
    ConceptLibModule,
    DesignationLibModule,
    ValueSetLibModule
  ],
  exports: [
    CodeSystemLibModule,
    MapSetLibModule,
    ConceptLibModule,
    DesignationLibModule,
    ValueSetLibModule
  ]
})
export class ResourcesLibModule {
}


