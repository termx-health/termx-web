import {Component, Input} from '@angular/core';
import {Resource} from 'term-web/resources/resource/model/resource';
import {ResourceVersion} from 'term-web/resources/resource/model/resource-version';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-resource-context',
  templateUrl: 'resource-context.component.html',
  styleUrls: ['resource-context.component.less'],
})
export class ResourceContextComponent {
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet';
  @Input() public resource: Resource;
  @Input() public conceptCode: string;
  @Input() public version: ResourceVersion;
  @Input() public versions: ResourceVersion[];
  @Input() public mode: 'summary' | 'concept-list' | 'concept-edit' | 'concept-view' | 'provenance'  = 'summary';

  public constructor(private router: Router) {}

  protected typeMap = {'CodeSystem': 'code-systems', 'ValueSet': 'value-sets', 'MapSet': 'map-sets'};


  protected unselectResourceOrVersion(): void {
    if (this.version) {
      const commands = {
        'summary': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'summary'],
        'concept-list': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'concepts'],
        'concept-edit': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'concepts', this.conceptCode, 'edit'],
        'concept-view': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'concepts', this.conceptCode, 'view'],
        'provenance': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'provenances']
      };
      this.router.navigate(commands[this.mode]);
    } else {
      this.router.navigate(['/resources', this.typeMap[this.resourceType]]);
    }
  }

  protected selectVersion(version: string): void {
    const commands = {
      'summary': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'summary'],
      'concept-list': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'concepts'],
      'concept-edit': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'concepts', this.conceptCode, 'edit'],
      'concept-view': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'concepts', this.conceptCode, 'view'],
      'provenance': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'provenances'],
    };
    this.router.navigate(commands[this.mode]);
  }

  public navigate(mode: string): void {
    if (this.version?.version) {
      this.router.navigate(['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', this.version.version, mode]);
    } else {
      this.router.navigate(['/resources', this.typeMap[this.resourceType], this.resource.id, mode]);
    }
  }
}
