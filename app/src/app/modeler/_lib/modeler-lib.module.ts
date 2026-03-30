import {PortalModule} from '@angular/cdk/portal';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaQuillModule} from '@termx-health/quill';
import {MarinaComponentsModule} from '@termx-health/ui';
import {NzListModule} from 'ng-zorro-antd/list';
import {StructureDefinitionEditableTreeComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-editable-tree.component';
import {StructureDefinitionSelectComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-select.component';
import {TransformationDefinitionLibService} from 'term-web/modeler/_lib/transformer/transformation-definition-lib.service';
import {TransformationDefinitionSelectComponent} from 'term-web/modeler/_lib/transformer/transformation-definition-select.component';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {StructureDefinitionLibService} from 'term-web/modeler/_lib/structure-definition/structure-definition-lib.service';
import {StructureDefinitionTreeComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-tree.component';

@NgModule({
    imports: [
        FormsModule,
        MarinaComponentsModule,
        CoreUtilModule,
        PortalModule,
        NzListModule,
        CoreUiModule,
        MarinaQuillModule,
        StructureDefinitionTreeComponent,
        StructureDefinitionEditableTreeComponent,
        StructureDefinitionSelectComponent,
        TransformationDefinitionSelectComponent,
    ],
    providers: [
        StructureDefinitionLibService,
        TransformationDefinitionLibService
    ],
    exports: [
        StructureDefinitionTreeComponent,
        StructureDefinitionEditableTreeComponent,
        StructureDefinitionSelectComponent,
        TransformationDefinitionSelectComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class ModelerLibModule {
}
