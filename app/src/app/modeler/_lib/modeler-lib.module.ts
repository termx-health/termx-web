import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {NzListModule} from 'ng-zorro-antd/list';
import {PortalModule} from '@angular/cdk/portal';
import {StructureDefinitionLibService} from './structure-definition/structure-definition-lib.service';
import {StructureDefinitionTreeComponent} from './structure-definition/structure-definition-tree.component';
import {StructureDefinitionSelectComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-select.component';
import {StructureDefinitionEditableTreeComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-editable-tree.component';
import {TransformationDefinitionLibService} from 'term-web/modeler/_lib/transformer/transformation-definition-lib.service';
import {TransformationDefinitionSelectComponent} from 'term-web/modeler/_lib/transformer/transformation-definition-select.component';

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
    TransformationDefinitionSelectComponent
  ],
  exports: [
    StructureDefinitionTreeComponent,
    StructureDefinitionEditableTreeComponent,
    StructureDefinitionSelectComponent,
    TransformationDefinitionSelectComponent
  ]
})
export class ModelerLibModule {
}
