import { Component, Input, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import {Resource} from 'term-web/resources/resource/model/resource';
import {ResourceVersion} from 'term-web/resources/resource/model/resource-version';
import { MarinPageLayoutModule, MuiCoreModule, MuiIconModule, MuiDropdownModule } from '@termx-health/ui';
import { NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';
import { ApplyPipe, IncludesPipe } from '@termx-health/core-util';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    selector: 'tw-resource-context',
    templateUrl: 'resource-context.component.html',
    styleUrls: ['resource-context.component.less'],
    imports: [
    MarinPageLayoutModule,
    MuiCoreModule,
    RouterLinkActive,
    RouterLink,
    NgTemplateOutlet,
    MuiIconModule,
    MuiDropdownModule,
    UpperCasePipe,
    TranslatePipe,
    MarinaUtilModule,
    ApplyPipe,
    IncludesPipe,
    PrivilegedPipe
],
})
export class ResourceContextComponent {
  private router = inject(Router);

  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'ImplementationGuide' | 'TerminologyServer' | 'StructureDefinition';
  @Input() public resource: Resource;
  @Input() public conceptCode: string;
  @Input() public version: ResourceVersion;
  @Input() public versions: ResourceVersion[];
  @Input() public mode: 'summary' | 'details' | 'concept-list' | 'concept-edit' | 'concept-view' | 'provenance' | 'properties' | 'checklist' | 'resources' | 'elements' | 'fsh' | 'json' = 'summary';

  protected typeMap = {'CodeSystem': 'code-systems', 'ValueSet': 'value-sets', 'MapSet': 'map-sets', 'ImplementationGuide': 'implementation-guides', 'TerminologyServer': 'servers', 'StructureDefinition': 'structure-definitions'};
  protected routePrefix = (type: string): string => type === 'TerminologyServer' ? '/' : type === 'StructureDefinition' ? '/modeler' : '/resources';

  public unselectResourceOrVersion(): void {
    const prefix = this.routePrefix(this.resourceType);
    if (this.version) {
      const base = [prefix, this.typeMap[this.resourceType], this.resource.id].filter(s => s !== '');
      const commands = {
        'summary': [...base, 'summary'],
        'details': [...base, 'details'],
        'concept-list': [...base, 'concepts'],
        'concept-edit': [...base, 'concepts', this.conceptCode, 'edit'],
        'concept-view': [...base, 'concepts', this.conceptCode, 'view'],
        'properties': [...base, 'properties'],
        'provenance': [...base, 'provenances'],
        'checklist': [...base, 'checklists'],
        'elements': [...base, 'summary'],
        'fsh': [...base, 'summary'],
        'json': [...base, 'summary']
      };
      this.router.navigate(commands[this.mode], {replaceUrl: true});
    } else {
      this.router.navigate([prefix, this.typeMap[this.resourceType]].filter(s => s !== ''));
    }
  }

  public selectVersion(version: string): void {
    const prefix = this.routePrefix(this.resourceType);
    const base = [prefix, this.typeMap[this.resourceType], this.resource.id, 'versions', version].filter(s => s !== '');
    const commands = {
      'summary': [...base, 'summary'],
      'details': [...base, 'details'],
      'concept-list': [...base, 'concepts'],
      'concept-edit': [...base, 'concepts', this.conceptCode, 'edit'],
      'concept-view': [...base, 'concepts', this.conceptCode, 'view'],
      'properties': [...base, 'properties'],
      'provenance': [...base, 'provenances'],
      'checklist': [...base, 'checklists'],
      'elements': [...base, 'elements'],
      'fsh': [...base, 'fsh'],
      'json': [...base, 'json'],
    };
    this.router.navigate(commands[this.mode], {replaceUrl: true});
  }

  public navigate(mode: string): any[] {
    const prefix = this.routePrefix(this.resourceType);
    if (this.resourceType === 'StructureDefinition' && this.version?.version && mode === 'details') {
      return [prefix, this.typeMap[this.resourceType], this.resource.id, 'edit'].filter(s => s !== '');
    }
    if (this.version?.version) {
      return [prefix, this.typeMap[this.resourceType], this.resource.id, 'versions', this.version.version, mode].filter(s => s !== '');
    } else {
      return [prefix, this.typeMap[this.resourceType], this.resource.id, mode].filter(s => s !== '');
    }
  }

  protected hasExternalReference = (resource: any): boolean => {
    return resource?.['properties']?.find(p => p.type === 'Coding');
  };


  private displayNames = {'TerminologyServer': 'Server'};

  protected capitalz = (n: string): string => {
    if (this.displayNames[n]) { return this.displayNames[n]; }
    return n.split('').filter(l => l === l.toUpperCase()).join('');
  };

}
