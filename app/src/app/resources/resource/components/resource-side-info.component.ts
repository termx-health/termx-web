import {Component, Input} from '@angular/core';


@Component({
  selector: 'tw-resource-side-info',
  templateUrl: 'resource-side-info.component.html'
})
export class ResourceSideInfoComponent {
  @Input() public copyright: {holder?: string, jurisdiction?: string, statement?: string};
  @Input() public permissions?: {admin?: string, editor?: string, viewer?: string, endorser?: string};
  @Input() public settings?: {reviewRequired?: boolean, approvalRequired?: boolean};
}
