import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ModelerLibModule} from '../_lib';
import {StructureDefinitionListComponent} from './containers/structure-definition-list.component';
import {StructureDefinitionEditComponent} from './containers/structure-definition-edit.component';
import {StructureDefinitionTypeListComponent} from './components/structure-definition-type-list.component';
import {StructureDefinitionConstraintListComponent} from './components/structure-definition-constraint-list.component';
import {StructureDefinitionService} from './services/structure-definition.service';
import {PortalModule} from '@angular/cdk/portal';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {MeasurementUnitLibModule} from 'term-web/measurement-unit/_lib';

export const STRUCTURE_DEFINITION_ROUTES: Routes = [
  {path: 'structure-definitions', component: StructureDefinitionListComponent},
  {path: 'structure-definitions/add', component: StructureDefinitionEditComponent, data: {privilege: ['*.StructureDefinition.edit']}},
  {path: 'structure-definitions/:id/edit', component: StructureDefinitionEditComponent, data: {privilege: ['{id}.StructureDefinition.edit']}},
];

@NgModule({
  imports: [
    CoreUiModule,
    ModelerLibModule,

    PortalModule,
    ResourcesLibModule,
    IntegrationLibModule,
    MeasurementUnitLibModule
  ],
  declarations: [
    StructureDefinitionListComponent,
    StructureDefinitionEditComponent,
    StructureDefinitionTypeListComponent,
    StructureDefinitionConstraintListComponent,
  ],
  providers: [
    StructureDefinitionService
  ]
})
export class StructureDefinitionModule {
}
