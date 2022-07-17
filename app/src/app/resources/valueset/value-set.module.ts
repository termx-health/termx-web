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
import {ValueSetRuleFormComponent} from './containers/version/ruleset/rule/value-set-rule-form.component';
import {ValueSetRuleFilterListComponent} from './containers/version/ruleset/rule/filter/value-set-rule-filter-list.component';
import {ValueSetVersionConceptModalComponent} from './containers/version/concepts/value-set-version-concept-modal.component';
import {ContactModule} from '../contact/contact.module';
import {ResourcesLibModule} from 'terminology-lib/resources';
import {FinderValueSetListComponent} from './containers-finder/value-set-list.component';
import {FinderModule} from '../../core/finder/finder.module';
import {FinderValueSetViewComponent} from './containers-finder/value-set-view.component';
import {FinderValueSetVersionViewComponent} from './containers-finder/version/value-set-version-view.component';
import {ValueSetViewComponent} from './containers/edit/value-set-view.component';
import {ValueSetRuleConceptListComponent} from './containers/version/ruleset/rule/concept/value-set-rule-concept-list.component';
import {ValueSetVersionConceptEditComponent} from './containers/version/concepts/value-set-version-concept-edit.component';
import {ValueSetRuleEditComponent} from './containers/version/ruleset/rule/value-set-rule-edit.component';


export const VALUE_SET_ROUTES: Routes = [
  {path: 'add', component: ValueSetEditComponent, data: {privilege: ['*.value-set.edit']}},
  {path: ':id/edit', component: ValueSetEditComponent, data: {privilege: ['*.value-set.edit']}},
  {path: ':id/view', component: ValueSetViewComponent},
  {path: ':id/versions/add', component: ValueSetVersionEditComponent, data: {privilege: ['*.value-set.edit']}},
  {path: ':id/versions/:versionCode/edit', component: ValueSetVersionEditComponent, data: {privilege: ['*.value-set.edit']}},
  {path: ':id/versions/:versionCode/view', component: ValueSetVersionViewComponent},
  {path: ':id/versions/:versionCode/concepts/add', component: ValueSetVersionConceptEditComponent, data: {privilege: ['*.value-set.edit']}},
  {path: ':id/versions/:versionCode/concepts/:conceptId/edit', component: ValueSetVersionConceptEditComponent, data: {privilege: ['*.value-set.edit']}},
  {path: ':id/versions/:versionCode/rule-sets/:ruleSetId/rules/add', component: ValueSetRuleEditComponent, data: {privilege: ['*.value-set.edit']}},
  {path: ':id/versions/:versionCode/rule-sets/:ruleSetId/rules/:ruleId/edit', component: ValueSetRuleEditComponent, data: {privilege: ['*.value-set.edit']}},
];

export const VALUE_SET_FINDER_ROUTES: Routes = [{
  path: '', component: FinderValueSetListComponent, children: [{
    path: ':id', component: FinderValueSetViewComponent, children: [{
      path: 'versions/:versionCode', component: FinderValueSetVersionViewComponent

    }]
  }]
}];

@NgModule({
  imports: [
    SharedModule,
    FinderModule,
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
    ValueSetVersionConceptEditComponent,
    ValueSetVersionConceptModalComponent,
    ValueSetRuleSetComponent,
    ValueSetRuleFormComponent,
    ValueSetRuleEditComponent,
    ValueSetRuleFilterListComponent,
    ValueSetRuleConceptListComponent,

    FinderValueSetListComponent,
    FinderValueSetViewComponent,
    FinderValueSetVersionViewComponent,
    ValueSetViewComponent
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
