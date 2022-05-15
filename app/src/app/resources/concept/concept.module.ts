import {NgModule} from '@angular/core';
import {ConceptLibModule} from 'terminology-lib/resources';
import {ConceptService} from './services/concept.service';


@NgModule({
  imports: [
    ConceptLibModule
  ],
  providers: [
    ConceptService
  ]
})
export class ConceptModule {
}
