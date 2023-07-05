import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {PortalModule} from '@angular/cdk/portal';
import {ResourcesLibModule} from '../resources/_lib';
import {IntegrationLibModule} from '../integration/_lib';
import {StructureDefinitionListComponent} from './structure-definition/containers/structure-definition-list.component';
import {StructureDefinitionEditComponent} from './structure-definition/containers/structure-definition-edit.component';
import {StructureDefinitionTypeListComponent} from './structure-definition/components/structure-definition-type-list.component';
import {StructureDefinitionConstraintListComponent} from './structure-definition/components/structure-definition-constraint-list.component';
import {StructureDefinitionService} from './structure-definition/services/structure-definition.service';
import {ModelerLibModule} from 'term-web/modeler/_lib';

export const MODELER_ROUTES: Routes = [
  {path: 'structure-definitions', component: StructureDefinitionListComponent},
  {path: 'structure-definitions/add', component: StructureDefinitionEditComponent, data: {privilege: ['*.Modeler.edit']}},
  {path: 'structure-definitions/:id/edit', component: StructureDefinitionEditComponent, data: {privilege: ['*.Modeler.edit']}},
];

@NgModule({
  imports: [
    CoreUiModule,
    ModelerLibModule,

    PortalModule,
    ResourcesLibModule,
    IntegrationLibModule,
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
export class ModelerModule {
}
