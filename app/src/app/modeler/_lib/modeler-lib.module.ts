import {PortalModule} from '@angular/cdk/portal';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {NzListModule} from 'ng-zorro-antd/list';
import {StructureDefinitionEditableTreeComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-editable-tree.component';
import {StructureDefinitionSelectComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-select.component';
import {TransformationDefinitionLibService} from 'term-web/modeler/_lib/transformer/transformation-definition-lib.service';
import {TransformationDefinitionSelectComponent} from 'term-web/modeler/_lib/transformer/transformation-definition-select.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {StructureDefinitionLibService} from './structure-definition/structure-definition-lib.service';
import {StructureDefinitionTreeComponent} from './structure-definition/structure-definition-tree.component';
import {StructureDefinitionSearchComponent} from './structure-definition/containers/structure-definition-search/structure-definition-search.component';
import { TransformationDefinitionSearchComponent } from './transformer/containers/transformation-definition-search/transformation-definition-search.component';
import {
  StructureDefinitionWidgetComponent
} from "./structure-definition/containers/structure-definition-widget/structure-definition-widget.component";
import {
  TransformationDefinitionWidgetComponent
} from "./transformer/containers/transformation-definition-widget/transformation-definition-widget.component";

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    CoreUtilModule,
    PortalModule,
    NzListModule,
    CoreUiModule,
    MarinaQuillModule,
  ],
  providers: [
    StructureDefinitionLibService,
    TransformationDefinitionLibService
  ],
  declarations: [
    StructureDefinitionTreeComponent,
    StructureDefinitionEditableTreeComponent,
    StructureDefinitionSelectComponent,
    TransformationDefinitionSelectComponent,
    StructureDefinitionSearchComponent,
    TransformationDefinitionSearchComponent,
    StructureDefinitionWidgetComponent,
    TransformationDefinitionWidgetComponent
  ],
  exports: [
    StructureDefinitionTreeComponent,
    StructureDefinitionEditableTreeComponent,
    StructureDefinitionSelectComponent,
    TransformationDefinitionSelectComponent,
    StructureDefinitionSearchComponent,
    TransformationDefinitionSearchComponent,
    StructureDefinitionWidgetComponent,
    TransformationDefinitionWidgetComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ModelerLibModule {
}
