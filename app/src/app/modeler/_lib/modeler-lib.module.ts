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
    StructureDefinitionLibService
  ],
  declarations: [
    StructureDefinitionTreeComponent,
    StructureDefinitionEditableTreeComponent,
    StructureDefinitionSelectComponent,
  ],
  exports: [
    StructureDefinitionTreeComponent,
    StructureDefinitionEditableTreeComponent,
    StructureDefinitionSelectComponent,
  ]
})
export class ModelerLibModule {
}
