import {Component, Input} from '@angular/core';
import {BooleanInput} from '@termx-health/core-util';
import { NzCollapseComponent, NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';

import { MuiFormModule, MuiInputModule, MuiTextareaModule, MuiCheckboxModule } from '@termx-health/ui';
import { FormsModule } from '@angular/forms';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ResourceReadonlyConceptComponent } from 'term-web/resources/resource/components/resource-readonly-concept.component';


@Component({
    selector: 'tw-resource-side-info',
    templateUrl: 'resource-side-info.component.html',
    imports: [NzCollapseComponent, NzCollapsePanelComponent, MuiFormModule, MuiInputModule, FormsModule, ValueSetConceptSelectComponent, MuiTextareaModule, MuiCheckboxModule, TranslatePipe, ResourceReadonlyConceptComponent]
})
export class ResourceSideInfoComponent {
  @Input() public copyright: {holder?: string, jurisdiction?: string, statement?: string};
  @Input() public permissions?: {admin?: string, editor?: string, viewer?: string, endorser?: string};
  @Input() public settings?: {reviewRequired?: boolean, approvalRequired?: boolean};
  @Input() @BooleanInput() public viewMode: boolean | string = false;
}
