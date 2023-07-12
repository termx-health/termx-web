import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {ValueSetListComponent} from './containers/list/value-set-list.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ValueSetService} from './services/value-set.service';
import {ValueSetRuleFormComponent} from './containers/version/rule/value-set-rule-form.component';
import {ValueSetRuleFilterListComponent} from './containers/version/rule/filter/value-set-rule-filter-list.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {FinderValueSetListComponent} from './containers-finder/value-set-list.component';
import {FinderModule} from '../../core/components/finder/finder.module';
import {FinderValueSetViewComponent} from './containers-finder/value-set-view.component';
import {FinderValueSetVersionViewComponent} from './containers-finder/version/value-set-version-view.component';
import {ValueSetRuleConceptListComponent} from './containers/version/rule/concept/value-set-rule-concept-list.component';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {IntegrationLibModule} from '../../integration/_lib';
import {MeasurementUnitLibModule} from '../../measurement-unit/_lib';
import {ValueSetEditComponent} from 'term-web/resources/value-set/containers/edit/value-set-edit.component';
import {ValueSetSummaryComponent} from 'term-web/resources/value-set/containers/summary/value-set-summary.component';
import {ValueSetInfoWidgetComponent} from 'term-web/resources/value-set/containers/summary/widgets/value-set-info-widget.component';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {ValueSetVersionsWidgetComponent} from 'term-web/resources/value-set/containers/summary/widgets/value-set-versions-widget.component';
import {ValueSetVersionSummaryComponent} from 'term-web/resources/value-set/containers/version/summary/value-set-version-summary.component';
import {ValueSetVersionInfoWidgetComponent} from 'term-web/resources/value-set/containers/version/widgets/value-set-version-info-widget.component';
import {ValueSetVersionRuleSetWidgetComponent} from 'term-web/resources/value-set/containers/version/widgets/value-set-version-rule-set-widget.component';
import {ValueSetConceptsComponent} from 'term-web/resources/value-set/containers/concepts/value-set-concepts.component';
import {ValueSetVersionConceptsComponent} from 'term-web/resources/value-set/containers/version/concepts/value-set-version-concepts.component';
import {ValueSetVersionEditComponent} from 'term-web/resources/value-set/containers/version/edit/value-set-version-edit.component';
import {UserLibModule} from 'term-web/user/_lib';
import {ValueSetProvenancesComponent} from 'term-web/resources/value-set/containers/provenance/value-set-provenances.component';
import {SysLibModule} from 'term-web/sys/_lib';
import {ValueSetVersionProvenancesComponent} from 'term-web/resources/value-set/containers/version/provenance/value-set-version-provenances.component';


export const VALUE_SET_ROUTES: Routes = [
  {path: '', component: ValueSetListComponent},
  {path: 'add', component: ValueSetEditComponent, data: {privilege: ['*.ValueSet.edit']}},
  {path: ':id/edit', component: ValueSetEditComponent, data: {privilege: ['*.ValueSet.edit']}},
  {path: ':id/summary', component: ValueSetSummaryComponent},
  {path: ':id/concepts', component: ValueSetConceptsComponent},
  {path: ':id/provenances', component: ValueSetProvenancesComponent},
  {path: ':id/versions/add', component: ValueSetVersionEditComponent, data: {privilege: ['*.ValueSet.edit']}},
  {path: ':id/versions/:versionCode/summary', component: ValueSetVersionSummaryComponent},
  {path: ':id/versions/:versionCode/concepts', component: ValueSetVersionConceptsComponent},
  {path: ':id/versions/:versionCode/provenances', component: ValueSetVersionProvenancesComponent},
  {path: ':id/versions/:versionCode/edit', component: ValueSetVersionEditComponent, data: {privilege: ['*.ValueSet.edit']}}
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
    CoreUiModule,
    FinderModule,
    ResourcesLibModule,
    IntegrationLibModule,
    MeasurementUnitLibModule,
    MarinaQuillModule,
    ResourceModule,
    UserLibModule,
    SysLibModule
  ],
  declarations: [
    ValueSetListComponent,
    ValueSetVersionEditComponent,
    ValueSetRuleFormComponent,
    ValueSetRuleFilterListComponent,
    ValueSetRuleConceptListComponent,

    FinderValueSetListComponent,
    FinderValueSetViewComponent,
    FinderValueSetVersionViewComponent,

    ValueSetEditComponent,
    ValueSetSummaryComponent,
    ValueSetInfoWidgetComponent,
    ValueSetVersionsWidgetComponent,
    ValueSetConceptsComponent,
    ValueSetProvenancesComponent,

    ValueSetVersionSummaryComponent,
    ValueSetVersionInfoWidgetComponent,
    ValueSetVersionRuleSetWidgetComponent,
    ValueSetVersionConceptsComponent,
    ValueSetVersionProvenancesComponent
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
