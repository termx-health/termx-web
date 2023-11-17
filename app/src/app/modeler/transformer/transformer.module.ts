import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ModelerLibModule} from '../_lib';
import {TransformationDefinitionResourcesComponent} from 'term-web/modeler/transformer/components/transformation-definition-resources.component';
import {TransformationDefinitionEditComponent} from 'term-web/modeler/transformer/containers/transformation-definition-edit.component';
import {TransformationDefinitionResourceFormComponent} from 'term-web/modeler/transformer/components/transformation-definition-resource-form.component';
import {TransformationDefinitionExecutionComponent} from 'term-web/modeler/transformer/components/transformation-definition-execution.component';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {TransformationDefinitionListComponent} from 'term-web/modeler/transformer/containers/transformation-definition-list.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {TransformationDefinitionSelectComponent} from 'term-web/modeler/transformer/components/transformation-definition-select.component';

export const TRANSFORMATION_DEFINITION_ROUTES: Routes = [
  {path: 'transformation-definitions', component: TransformationDefinitionListComponent},
  {path: 'transformation-definitions/add', data: {privilege: ['*.TransformationDefinition.edit']}, component: TransformationDefinitionEditComponent},
  {path: 'transformation-definitions/:id/edit', data: {privilege: ['{id}.TransformationDefinition.view']}, component: TransformationDefinitionEditComponent},
];

@NgModule({
  imports: [
    CoreUiModule,
    ModelerLibModule,
    ResourcesLibModule
  ],
  declarations: [
    TransformationDefinitionSelectComponent,

    TransformationDefinitionResourcesComponent,
    TransformationDefinitionResourceFormComponent,
    TransformationDefinitionExecutionComponent,

    TransformationDefinitionEditComponent,
    TransformationDefinitionListComponent
  ],
  exports: [
    TransformationDefinitionSelectComponent
  ],
  providers: [
    TransformationDefinitionService
  ]
})
export class TransformerModule {
}
