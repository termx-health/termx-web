import {NgModule} from '@angular/core';
import {MuiComponentsModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {AssociationLibService} from './services/association-lib.service';
import {AssociationTypeSearchComponent} from './containers/association-type-search.component';

@NgModule({
  imports: [
    MuiComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [
    AssociationLibService,
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
