import {NgModule} from '@angular/core';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {NzListModule} from 'ng-zorro-antd/list';
import {PortalModule} from '@angular/cdk/portal';
import {StructureDefinitionLibService} from './structure-definition/structure-definition-lib.service';
import {StructureDefinitionTreeComponent} from './structure-definition/structure-definition-tree.component';

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
  ],
  exports: [
    StructureDefinitionTreeComponent,
  ]
})
export class ModelerLibModule {
}
