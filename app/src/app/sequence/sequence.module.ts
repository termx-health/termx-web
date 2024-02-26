import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {InvalidSequenceCodeValidatorDirective, SequenceEditComponent} from 'term-web/sequence/containers/sequence-edit.component';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {SequenceLibModule} from './_lib/sequence-lib.module';
import {SequenceListComponent} from './containers/sequence-list.component';
import {SequenceService} from './services/sequence.service';

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
