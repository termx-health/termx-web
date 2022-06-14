import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CacheService} from './services/cache.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    CacheService
  ]
})
export class UtilLibModule {
}
