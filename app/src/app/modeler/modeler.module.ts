import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {ModelerLibModule} from 'term-web/modeler/_lib';
import {STRUCTURE_DEFINITION_ROUTES, StructureDefinitionModule} from 'term-web/modeler/structure-definition/structure-definition.module';
import {TRANSFORMATION_DEFINITION_ROUTES, TransformerModule} from 'term-web/modeler/transformer/transformer.module';

export const MODELER_ROUTES: Routes = [
  ...STRUCTURE_DEFINITION_ROUTES,
  ...TRANSFORMATION_DEFINITION_ROUTES
];

@NgModule({
  imports: [
    CoreUiModule,
    ModelerLibModule,
    StructureDefinitionModule,
    TransformerModule
  ],
})
export class ModelerModule {
}
