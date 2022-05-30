import {NgModule} from '@angular/core';
import {CodeSystemLibModule} from './codesystem';
import {DesignationLibModule} from './designation';
import {ValueSetLibModule} from './valueset';
import {MapSetLibModule} from './mapset';

@NgModule({
  declarations: [],
  imports: [
    CodeSystemLibModule,
    MapSetLibModule,
    DesignationLibModule,
    ValueSetLibModule
  ],
  exports: [
    CodeSystemLibModule,
    MapSetLibModule,
    DesignationLibModule,
    ValueSetLibModule
  ]
})
export class ResourcesLibModule {
}


