import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {MuiCardModule, MuiFormModule, MuiListModule, MuiSpinnerModule, MuiNoDataModule, MuiTagModule, MuiIconModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthoritativeResource, Server} from 'term-web/sys/_lib/space';
import {ServerService} from 'term-web/sys/space/services/server.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';

@Component({
  templateUrl: './server-resources.component.html',
  imports: [MuiCardModule, MuiFormModule, MuiListModule, MuiSpinnerModule, MuiNoDataModule, MuiTagModule, MuiIconModule,
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

  getResourceLink(resource: AuthoritativeResource): string[] | null {
    switch (this.selectedResourceType) {
      case 'code-systems': return ['/resources', 'code-systems', resource.name, 'summary'];
      case 'value-sets': return ['/resources', 'value-sets', resource.name, 'summary'];
      case 'concept-maps': return ['/resources', 'map-sets', resource.name, 'summary'];
      case 'structure-definitions': return ['/modeler', 'structure-definitions', resource.name];
      case 'structure-maps': return ['/modeler', 'transformation-definitions', resource.name];
      default: return null;
    }
  }
}
