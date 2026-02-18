import {Component, Input} from '@angular/core';
import {Telecom} from 'term-web/resources/_lib';
import {ImplementationGuide} from 'term-web/implementation-guide/_lib';
import { AsyncPipe } from '@angular/common';
import { MuiNoDataModule, MuiIconModule, MuiDividerModule } from '@kodality-web/marina-ui';
import { CopyContainerComponent } from 'term-web/core/ui/components/copy-container/copy-container.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { ApplyPipe } from '@kodality-web/core-util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-implementation-guide-info-widget',
    templateUrl: 'implementation-guide-info-widget.component.html',
    imports: [MuiNoDataModule, MuiIconModule, CopyContainerComponent, MuiDividerModule, AsyncPipe, TranslatePipe, MarinaUtilModule, ApplyPipe, LocalizedConceptNamePipe]
})
export class ImplementationGuideInfoWidgetComponent {
  @Input() public ig: ImplementationGuide;

  protected getTelecoms = (ig: ImplementationGuide): Telecom[] => {
    return ig.contacts?.flatMap(c => c.telecoms);
  };
}
