import {Component, Input} from '@angular/core';
import {MuiNoDataModule, MuiIconModule, MuiDividerModule, MuiCoreModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {TranslatePipe} from '@ngx-translate/core';
import {CopyContainerComponent} from 'term-web/core/ui/components/copy-container/copy-container.component';
import {StructureDefinition} from 'term-web/modeler/_lib';

@Component({
    selector: 'tw-structure-definition-info-widget',
    templateUrl: 'structure-definition-info-widget.component.html',
    imports: [MuiNoDataModule, MuiIconModule, MuiDividerModule, MuiCoreModule, MarinaUtilModule, TranslatePipe, CopyContainerComponent]
})
export class StructureDefinitionInfoWidgetComponent {
  @Input() public structureDefinition?: StructureDefinition;
}
