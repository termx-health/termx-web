import {NgModule} from '@angular/core';
import {DesignationLibModule} from 'terminology-lib/resources';
import {DesignationService} from './services/designation.service';


@NgModule({
  imports: [
    DesignationLibModule
  ],
  providers: [
    DesignationService
  ]
})
export class DesignationModule {
}
