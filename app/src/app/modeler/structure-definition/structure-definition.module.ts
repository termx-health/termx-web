import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {StructureDefinitionViewComponent} from 'term-web/modeler/structure-definition/containers/structure-definition-view.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {StructureDefinitionConstraintListComponent} from 'term-web/modeler/structure-definition/components/structure-definition-constraint-list.component';
import {StructureDefinitionTypeListComponent} from 'term-web/modeler/structure-definition/components/structure-definition-type-list.component';
import {StructureDefinitionEditComponent} from 'term-web/modeler/structure-definition/containers/structure-definition-edit.component';
import {StructureDefinitionListComponent} from 'term-web/modeler/structure-definition/containers/structure-definition-list.component';
import {StructureDefinitionSummaryComponent} from 'term-web/modeler/structure-definition/containers/summary/structure-definition-summary.component';
import {StructureDefinitionVersionSummaryComponent} from 'term-web/modeler/structure-definition/containers/version/structure-definition-version-summary.component';
import {StructureDefinitionVersionContentComponent} from 'term-web/modeler/structure-definition/containers/version/structure-definition-version-content.component';
import {StructureDefinitionVersionEditComponent} from 'term-web/modeler/structure-definition/containers/version/structure-definition-version-edit.component';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';

export const STRUCTURE_DEFINITION_ROUTES: Routes = [
  {path: 'structure-definitions', component: StructureDefinitionListComponent},
  {path: 'structure-definitions/add', component: StructureDefinitionEditComponent, data: {privilege: ['*.StructureDefinition.write']}},
  {path: 'structure-definitions/:id/edit', component: StructureDefinitionEditComponent, data: {privilege: ['{id}.StructureDefinition.write']}},
  {path: 'structure-definitions/:id/summary', component: StructureDefinitionSummaryComponent, data: {privilege: ['{id}.StructureDefinition.read']}},
  {path: 'structure-definitions/:id/details', component: StructureDefinitionEditComponent, data: {privilege: ['{id}.StructureDefinition.read']}},
  {path: 'structure-definitions/:id/versions/add', component: StructureDefinitionVersionEditComponent, data: {privilege: ['{id}.StructureDefinition.write']}},
  {path: 'structure-definitions/:id/versions/:versionCode/summary', component: StructureDefinitionVersionSummaryComponent, data: {privilege: ['{id}.StructureDefinition.read']}},
  {path: 'structure-definitions/:id/versions/:versionCode/edit', component: StructureDefinitionVersionEditComponent, data: {privilege: ['{id}.StructureDefinition.write']}},
  {path: 'structure-definitions/:id/versions/:versionCode/elements', component: StructureDefinitionVersionContentComponent, data: {privilege: ['{id}.StructureDefinition.read'], contentMode: 'elements'}},
  {path: 'structure-definitions/:id/versions/:versionCode/fsh', component: StructureDefinitionVersionContentComponent, data: {privilege: ['{id}.StructureDefinition.read'], contentMode: 'fsh'}},
  {path: 'structure-definitions/:id/versions/:versionCode/json', component: StructureDefinitionVersionContentComponent, data: {privilege: ['{id}.StructureDefinition.read'], contentMode: 'json'}},
  // {path: 'structure-definitions/:id/view', component: StructureDefinitionViewComponent, data: {privilege: ['{id}.StructureDefinition.read']}},
];

@NgModule({
    imports: [
        CoreUiModule,
        ModelerLibModule,
        PortalModule,
        ResourcesLibModule,
        IntegrationLibModule,
        StructureDefinitionListComponent,
        StructureDefinitionEditComponent,
        StructureDefinitionViewComponent,
        StructureDefinitionSummaryComponent,
        StructureDefinitionVersionSummaryComponent,
        StructureDefinitionVersionContentComponent,
        StructureDefinitionVersionEditComponent,
        StructureDefinitionTypeListComponent,
        StructureDefinitionConstraintListComponent
    ],
    providers: [
        StructureDefinitionService
    ]
})
export class StructureDefinitionModule {
}
