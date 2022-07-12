import {NgModule} from '@angular/core';
import {MuiComponentsModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {AssociationTypeLibService} from './services/association-type-lib.service';
import {AssociationTypeSearchComponent} from './containers/association-type-search.component';

@NgModule({
  imports: [
    MuiComponentsModule,
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