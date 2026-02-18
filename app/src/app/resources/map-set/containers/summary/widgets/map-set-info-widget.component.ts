import {Component, Input} from '@angular/core';
import {MapSet, Telecom} from 'term-web/resources/_lib';
import { AsyncPipe } from '@angular/common';
import { MuiNoDataModule, MuiIconModule, MuiDividerModule } from '@kodality-web/marina-ui';
import { CopyContainerComponent } from 'term-web/core/ui/components/copy-container/copy-container.component';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { ApplyPipe } from '@kodality-web/core-util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-map-set-info-widget',
    templateUrl: 'map-set-info-widget.component.html',
    imports: [MuiNoDataModule, MuiIconModule, CopyContainerComponent, MuiDividerModule, AsyncPipe, MarinaUtilModule, ApplyPipe, LocalizedConceptNamePipe]
})
export class MapSetInfoWidgetComponent {
  @Input() public mapSet: MapSet;

  protected getTelecoms = (ms: MapSet): Telecom[] => {
    return ms.contacts?.flatMap(c => c.telecoms);
  };
}
