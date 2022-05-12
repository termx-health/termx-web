import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ValueSetLibService} from './services/value-set-lib.service';


@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ValueSetLibService
  ]
})
export class ValueSetLibModule {
}
