import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {AssociationTypeSearchComponent} from './containers/association-type-search.component';
import {AssociationTypeLibService} from './services/association-type-lib.service';

@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [
    AssociationTypeLibService,
  ],
  declarations: [
    AssociationTypeSearchComponent,
  ],
  exports: [
    AssociationTypeSearchComponent,
  ]
})
export class AssociationLibModule {
}
