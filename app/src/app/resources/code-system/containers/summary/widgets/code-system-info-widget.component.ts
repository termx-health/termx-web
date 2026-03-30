import {Component, Input} from '@angular/core';
import { group, collect, ApplyPipe, JoinPipe, MapPipe } from '@termx-health/core-util';
import {CodeSystem, Telecom} from 'term-web/resources/_lib';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { MuiNoDataModule, MuiIconModule, MuiDividerModule, MuiCoreModule } from '@termx-health/ui';
import { CopyContainerComponent } from 'term-web/core/ui/components/copy-container/copy-container.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-code-system-info-widget',
    templateUrl: 'code-system-info-widget.component.html',
    imports: [MuiNoDataModule, MuiIconModule, CopyContainerComponent, MuiDividerModule, MuiCoreModule, RouterLink, AsyncPipe, KeyValuePipe, TranslatePipe, MarinaUtilModule, ApplyPipe, JoinPipe, MapPipe, LocalizedConceptNamePipe]
})
export class CodeSystemInfoWidgetComponent {
  @Input() public codeSystem: CodeSystem;

  protected getTelecoms = (cs: CodeSystem): {[dType: string]: Telecom[]} => {
    return collect(cs.contacts?.flatMap(c => c.telecoms), t => t.system);
  };
  protected readonly group = group;
}
