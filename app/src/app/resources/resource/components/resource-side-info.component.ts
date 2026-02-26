import {Component, Input} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';


@Component({
  selector: 'tw-resource-side-info',
  templateUrl: 'resource-side-info.component.html'
})
export class ResourceSideInfoComponent {
  @Input() public copyright: {holder?: string, jurisdiction?: string, statement?: string};
  @Input() public permissions?: {admin?: string, editor?: string, viewer?: string, endorser?: string};
  @Input() public settings?: {reviewRequired?: boolean, approvalRequired?: boolean};
  @Input() @BooleanInput() public viewMode: boolean | string = false;
}
