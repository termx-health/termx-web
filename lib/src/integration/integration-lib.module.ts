import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IntegrationAtcLibService} from './atc/service/integration-atc-lib.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    IntegrationAtcLibService
  ]
})
export class IntegrationLibModule {
}