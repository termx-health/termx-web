import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserLibService} from './services/user-lib.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [UserLibService]
})
export class UserLibModule {
}
