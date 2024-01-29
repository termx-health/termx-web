import {NgModule} from '@angular/core';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {ChecklistLibService} from './services/checklist-lib.service';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    CoreUtilModule
  ],
  providers: [
    ChecklistLibService
  ],

})
export class ChecklistLibModule {
}