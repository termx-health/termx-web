import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {InvalidSequenceCodeValidatorDirective, SequenceEditComponent} from 'term-web/sequence/containers/sequence-edit.component';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {SequenceListComponent} from 'term-web/sequence/containers/sequence-list.component';
import {SequenceService} from 'term-web/sequence/services/sequence.service';

export const SEQUENCE_ROUTES: Routes = [
  {path: '', component: SequenceListComponent},
  {path: 'add', component: SequenceEditComponent},
  {path: ':id/edit', component: SequenceEditComponent},
];

@NgModule({
    imports: [
        SequenceLibModule,
        CoreUiModule,
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
