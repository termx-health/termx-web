import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ValueSetListComponent} from './containers/value-set-list.component';
import {ValueSetVersionEditComponent} from './containers/version/value-set-version-edit.component';
import {ValueSetVersionConceptListComponent} from './containers/version/concepts/value-set-version-concept-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {ValueSetService} from './services/value-set.service';
import {ValueSetEditComponent} from './containers/edit/value-set-edit.component';
import {ValueSetVersionsListComponent} from './containers/edit/value-set-versions-list.component';
import {ValueSetVersionViewComponent} from './containers/version/value-set-version-view.component';
import {ValueSetRuleSetComponent} from './containers/version/ruleset/value-set-rule-set.component';
import {ValueSetRuleSetRuleComponent} from './containers/version/ruleset/value-set-rule-set-rule.component';
import {ValueSetRuleFilterListComponent} from './containers/version/ruleset/value-set-rule-filter-list.component';
import {ValueSetVersionConceptModalComponent} from './containers/version/concepts/value-set-version-concept-modal.component';
import {ContactModule} from '../contact/contact.module';
import {ResourcesLibModule} from 'terminology-lib/resources/resources-lib.module';


export const VALUE_SET_ROUTES: Routes = [
  {path: 'add', component: ValueSetEditComponent},
  {path: ':id/edit', component: ValueSetEditComponent},
  {path: ':id/versions/add', component: ValueSetVersionEditComponent},
  {path: ':id/versions/:version/edit', component: ValueSetVersionEditComponent},
  {path: ':id/versions/:version/view', component: ValueSetVersionViewComponent},
];

@NgModule({
  imports: [
    SharedModule,
    ResourcesLibModule,
    ContactModule
  ],
  declarations: [
    ValueSetListComponent,
    ValueSetEditComponent,
    ValueSetVersionsListComponent,
    ValueSetVersionEditComponent,
    ValueSetVersionViewComponent,
    ValueSetVersionConceptListComponent,
    ValueSetVersionConceptModalComponent,
    ValueSetRuleSetComponent,
    ValueSetRuleSetRuleComponent,
    ValueSetRuleFilterListComponent
  ],
  exports: [
    ValueSetListComponent
  ],
  providers: [
    ValueSetService
  ]
})
export class ValueSetModule {
}
