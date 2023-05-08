import {NgModule} from '@angular/core';
import {SequenceLibModule} from './_lib/sequence-lib.module';
import {SequenceService} from './services/sequence.service';
import {Routes} from '@angular/router';
import {SequenceListComponent} from './containers/sequence-list.component';
import {SharedModule} from 'term-web/core/shared/shared.module';
import {SequenceEditComponent} from 'term-web/sequence/containers/sequence-edit.component';

export const SEQUENCE_ROUTES: Routes = [
  {path: '', component: SequenceListComponent},
  {path: 'add', component: SequenceEditComponent},
  {path: ':id/edit', component: SequenceEditComponent},
];

@NgModule({
  imports: [
    SequenceLibModule,
    SharedModule
  ],
  declarations: [
    SequenceListComponent,
    SequenceEditComponent
  ],
  providers: [
    SequenceService
  ]
})
export class SequenceModule {
}
