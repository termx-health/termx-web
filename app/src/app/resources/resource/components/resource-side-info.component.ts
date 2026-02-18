import {Component, Input} from '@angular/core';
import { NzCollapseComponent, NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';

import { MuiFormModule, MuiInputModule, MuiTextareaModule, MuiCheckboxModule } from '@kodality-web/marina-ui';
import { FormsModule } from '@angular/forms';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-resource-side-info',
    templateUrl: 'resource-side-info.component.html',
    imports: [NzCollapseComponent, NzCollapsePanelComponent, MuiFormModule, MuiInputModule, FormsModule, ValueSetConceptSelectComponent, MuiTextareaModule, MuiCheckboxModule, TranslatePipe]
})
export class ResourceSideInfoComponent {
  @Input() public copyright: {holder?: string, jurisdiction?: string, statement?: string};
  @Input() public permissions?: {admin?: string, editor?: string, viewer?: string, endorser?: string};
  @Input() public settings?: {reviewRequired?: boolean, approvalRequired?: boolean};
}
