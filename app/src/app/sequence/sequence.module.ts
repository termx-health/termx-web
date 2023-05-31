import {NgModule} from '@angular/core';
import {SequenceLibModule} from './_lib/sequence-lib.module';
import {SequenceService} from './services/sequence.service';
import {Routes} from '@angular/router';
import {SequenceListComponent} from './containers/sequence-list.component';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {InvalidSequenceCodeValidatorDirective, SequenceEditComponent} from 'term-web/sequence/containers/sequence-edit.component';

export const SEQUENCE_ROUTES: Routes = [
  {path: '', component: SequenceListComponent},
  {path: 'add', component: SequenceEditComponent},
  {path: ':id/edit', component: SequenceEditComponent},
];

@NgModule({
  imports: [
    SequenceLibModule,
    CoreUiModule
  ],
  declarations: [
    SequenceListComponent,
    SequenceEditComponent,
    InvalidSequenceCodeValidatorDirective
  ],
  providers: [
    SequenceService
  ]
})
export class SequenceModule {
}
