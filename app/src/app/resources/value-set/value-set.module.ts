import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {ValueSetConceptsComponent} from 'term-web/resources/value-set/containers/concepts/value-set-concepts.component';
import {ValueSetEditComponent} from 'term-web/resources/value-set/containers/edit/value-set-edit.component';
import {ValueSetProvenancesComponent} from 'term-web/resources/value-set/containers/provenance/value-set-provenances.component';
import {ValueSetSummaryComponent} from 'term-web/resources/value-set/containers/summary/value-set-summary.component';
import {ValueSetInfoWidgetComponent} from 'term-web/resources/value-set/containers/summary/widgets/value-set-info-widget.component';
import {ValueSetVersionsWidgetComponent} from 'term-web/resources/value-set/containers/summary/widgets/value-set-versions-widget.component';
import {ValueSetVersionConceptsComponent} from 'term-web/resources/value-set/containers/version/concepts/value-set-version-concepts.component';
import {ValueSetVersionEditComponent} from 'term-web/resources/value-set/containers/version/edit/value-set-version-edit.component';
import {ValueSetVersionSummaryComponent} from 'term-web/resources/value-set/containers/version/summary/value-set-version-summary.component';
import {ValueSetVersionInfoWidgetComponent} from 'term-web/resources/value-set/containers/version/widgets/value-set-version-info-widget.component';
import {ValueSetVersionRuleSetWidgetComponent} from 'term-web/resources/value-set/containers/version/widgets/value-set-version-rule-set-widget.component';
import {SysLibModule} from 'term-web/sys/_lib';
import {UserLibModule} from 'term-web/user/_lib';
import {FinderModule} from '../../core/components/finder/finder.module';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {IntegrationLibModule} from '../../integration/_lib';
import {MeasurementUnitLibModule} from '../../measurement-unit/_lib';
import {FinderValueSetListComponent} from './containers-finder/value-set-list.component';
import {FinderValueSetViewComponent} from './containers-finder/value-set-view.component';
import {FinderValueSetVersionViewComponent} from './containers-finder/version/value-set-version-view.component';
import {ValueSetListComponent} from './containers/list/value-set-list.component';
import {ValueSetRuleConceptListComponent} from './containers/version/rule/concept/value-set-rule-concept-list.component';
import {ValueSetRuleFilterListComponent} from './containers/version/rule/filter/value-set-rule-filter-list.component';
import {ValueSetRuleFormComponent} from './containers/version/rule/value-set-rule-form.component';
import {ValueSetService} from './services/value-set.service';

const EDIT = {privilege: ['{id}.ValueSet.edit']};
const VIEW = {privilege: ['{id}.ValueSet.view']};
export const VALUE_SET_ROUTES: Routes = [
  {path: '', component: ValueSetListComponent},
  {path: 'add', component: ValueSetEditComponent, data: {privilege: ['*.ValueSet.edit']}},
  {path: ':id/edit', component: ValueSetEditComponent, data: EDIT},
  {path: ':id/summary', component: ValueSetSummaryComponent, data: VIEW},
  {path: ':id/concepts', component: ValueSetConceptsComponent, data: VIEW},
  {path: ':id/provenances', component: ValueSetProvenancesComponent, data: VIEW},
  {path: ':id/versions/add', component: ValueSetVersionEditComponent, data: EDIT},
  {path: ':id/versions/:versionCode/summary', component: ValueSetVersionSummaryComponent, data: VIEW},
  {path: ':id/versions/:versionCode/concepts', component: ValueSetVersionConceptsComponent, data: VIEW},
  {path: ':id/versions/:versionCode/provenances', component: ValueSetProvenancesComponent, data: VIEW},
  {path: ':id/versions/:versionCode/edit', component: ValueSetVersionEditComponent, data: EDIT}
];

export const VALUE_SET_FINDER_ROUTES: Routes = [{
  path: '', component: FinderValueSetListComponent, children: [{
    path: ':id', component: FinderValueSetViewComponent, data: VIEW, children: [{
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
