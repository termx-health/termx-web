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
  @Input() public mode: 'summary' | 'concept-list' | 'concept-edit' | 'concept-view' | 'provenance' | 'properties'  = 'summary';

  public constructor(private router: Router) {}

  protected typeMap = {'CodeSystem': 'code-systems', 'ValueSet': 'value-sets', 'MapSet': 'map-sets'};

  public unselectResourceOrVersion(): void {
    if (this.version) {
      const commands = {
        'summary': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'summary'],
        'concept-list': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'concepts'],
        'concept-edit': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'concepts', this.conceptCode, 'edit'],
        'concept-view': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'concepts', this.conceptCode, 'view'],
        'properties': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'properties'],
        'provenance': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'provenances']
      };
      this.router.navigate(commands[this.mode], {replaceUrl: true});
    } else {
      this.router.navigate(['/resources', this.typeMap[this.resourceType]]);
    }
  }

  public selectVersion(version: string): void {
    const commands = {
      'summary': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'summary'],
      'concept-list': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'concepts'],
      'concept-edit': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'concepts', this.conceptCode, 'edit'],
      'concept-view': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'concepts', this.conceptCode, 'view'],
      'properties': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'properties'],
      'provenance': ['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', version, 'provenances'],
    };
    this.router.navigate(commands[this.mode], {replaceUrl: true});
  }

  public navigate(mode: string): void {
    if (this.version?.version) {
      this.router.navigate(['/resources', this.typeMap[this.resourceType], this.resource.id, 'versions', this.version.version, mode]);
    } else {
      this.router.navigate(['/resources', this.typeMap[this.resourceType], this.resource.id, mode]);
    }
  }

  protected hasExternalReference = (resource: any): boolean => {
   return resource?.['properties']?.find(p => p.type === 'Coding');
  };

}
