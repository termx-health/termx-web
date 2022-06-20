import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IntegrationAtcLibService} from './atc/service/integration-atc-lib.service';
import {IntegrationIcdLibService} from './icd-10/service/integration-icd-lib.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    IntegrationAtcLibService,
    IntegrationIcdLibService
  ]
})
export class IntegrationLibModule {
}