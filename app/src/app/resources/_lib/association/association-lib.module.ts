import {NgModule} from '@angular/core';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {AssociationTypeLibService} from './services/association-type-lib.service';
import {AssociationTypeSearchComponent} from './containers/association-type-search.component';

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
