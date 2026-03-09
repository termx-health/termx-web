import {Component, Input} from '@angular/core';
import { collect, ApplyPipe, JoinPipe, MapPipe } from '@kodality-web/core-util';
import {Telecom, ValueSet} from 'term-web/resources/_lib';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { MuiNoDataModule, MuiIconModule } from '@kodality-web/marina-ui';
import { CopyContainerComponent } from 'term-web/core/ui/components/copy-container/copy-container.component';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-value-set-info-widget',
    templateUrl: 'value-set-info-widget.component.html',
    imports: [MuiNoDataModule, MuiIconModule, CopyContainerComponent, AsyncPipe, KeyValuePipe, MarinaUtilModule, ApplyPipe, JoinPipe, MapPipe, LocalizedConceptNamePipe]
})
export class ValueSetInfoWidgetComponent {
  @Input() public valueSet: ValueSet;

  protected getTelecoms = (vs: ValueSet):  {[dType: string]: Telecom[]} => {
    return collect(vs.contacts?.flatMap(c => c.telecoms), t => t.system);
  };
}
