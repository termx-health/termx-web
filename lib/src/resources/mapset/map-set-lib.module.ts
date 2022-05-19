import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapSetLibService} from './services/map-set-lib.service';


@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    MapSetLibService
  ]
})
export class MapSetLibModule {
}
