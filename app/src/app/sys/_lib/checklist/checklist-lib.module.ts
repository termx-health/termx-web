import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {ChecklistLibService} from 'term-web/sys/_lib/checklist/services/checklist-lib.service';

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
