import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {MuiCardModule, MuiFormModule, MuiListModule, MuiSpinnerModule, MuiNoDataModule, MuiTagModule, MuiIconModule, MuiTooltipModule} from '@termx-health/ui';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthoritativeResource, Server} from 'term-web/sys/_lib/space';
import {ServerService} from 'term-web/sys/space/services/server.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';

@Component({
  templateUrl: './server-resources.component.html',
  imports: [MuiCardModule, MuiFormModule, MuiListModule, MuiSpinnerModule, MuiNoDataModule, MuiTagModule, MuiIconModule, MuiTooltipModule,
    FormsModule, TranslatePipe, RouterLink, ResourceContextComponent]
})
export class ServerResourcesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private serverService = inject(ServerService);

  protected server?: Server;
  protected loader = new LoadingManager();
  protected selectedResourceType = 'code-systems';
  protected matchedResources: AuthoritativeResource[] = [];

  protected resourceTypes = [
    {value: 'code-systems', label: 'entities.code-system.plural'},
    {value: 'value-sets', label: 'entities.value-set.plural'},
    {value: 'concept-maps', label: 'entities.map-set.plural'},
    {value: 'structure-definitions', label: 'entities.structure-definition.plural'},
    {value: 'structure-maps', label: 'web.server.structure-maps'},
  ];

  protected get resourceAdapter(): any {
    return this.server ? {id: this.server.id, title: this.server.names, name: this.server.code} : undefined;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load', this.serverService.load(Number(id)))
      .subscribe(ts => {
        this.server = ts;
        this.loadResources();
      });
  }

  selectResourceType(type: string): void {
    if (!type || !this.server) {
      return;
    }
    this.selectedResourceType = type;
    this.loadResources();
  }

  private loadResources(): void {
    if (!this.server) {
      return;
    }
    this.loader.wrap('resources', this.serverService.loadMatchingResources(this.server.id, this.selectedResourceType))
      .subscribe(r => this.matchedResources = r);
  }

  protected get remote(): boolean {
    return !!this.server && !this.server.currentInstallation;
  }

  private fhirType(type = this.selectedResourceType): string | null {
    switch (type) {
      case 'code-systems': return 'CodeSystem';
      case 'value-sets': return 'ValueSet';
      case 'concept-maps': return 'ConceptMap';
      case 'structure-definitions': return 'StructureDefinition';
      case 'structure-maps': return 'StructureMap';
      default: return null;
    }
  }

  getResourceLink(resource: AuthoritativeResource): string[] | null {
    // Local installation: open the rich local editors as before.
    if (!this.remote) {
      switch (this.selectedResourceType) {
        case 'code-systems': return ['/resources', 'code-systems', resource.name, 'summary'];
        case 'value-sets': return ['/resources', 'value-sets', resource.name, 'summary'];
        case 'concept-maps': return ['/resources', 'map-sets', resource.name, 'summary'];
        case 'structure-definitions': return ['/modeler', 'structure-definitions', resource.name];
        case 'structure-maps': return ['/modeler', 'transformation-definitions', resource.name];
        default: return null;
      }
    }
    // Remote server: render the remote resource in the FHIR viewer (fetched via the server proxy).
    const type = this.fhirType();
    return type === 'CodeSystem' || type === 'ValueSet' || type === 'ConceptMap' ? ['/fhir', type, resource.name] : null;
  }

  /** For remote servers, tells the FHIR viewer to fetch the resource from this server instead of the local DB. */
  getResourceQueryParams(): {[key: string]: string} | null {
    return this.remote && this.server ? {server: String(this.server.id)} : null;
  }

  /** Direct link to the resource on the remote server's own FHIR endpoint (opens in a new tab). */
  remoteResourceUrl(resource: AuthoritativeResource): string | null {
    if (!this.remote || !this.server?.rootUrl || !resource.name) {
      return null;
    }
    const type = this.fhirType();
    return type ? `${this.server.rootUrl.replace(/\/+$/, '')}/${type}/${resource.name}` : null;
  }
}
