import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LoadingManager, copyDeep} from '@termx-health/core-util';
import {
  MuiButtonModule, MuiCardModule, MuiEditableTableModule, MuiFormModule,
  MuiIconModule, MuiInputModule, MuiSelectModule
} from '@termx-health/ui';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthoritativeResource, Server} from 'term-web/sys/_lib/space';
import {ServerService} from 'term-web/sys/space/services/server.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {CodeSystemSearchComponent} from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import {ValueSetSearchComponent} from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import {StatusTagComponent} from 'term-web/core/ui/components/publication-status-tag/status-tag.component';

interface AuthoritativeResourceRow extends AuthoritativeResource {
  _inclusive?: boolean;
}

@Component({
  templateUrl: './server-authoritative-edit.component.html',
  imports: [
    CommonModule, FormsModule, TranslatePipe,
    MuiButtonModule, MuiCardModule, MuiEditableTableModule, MuiFormModule,
    MuiIconModule, MuiInputModule, MuiSelectModule,
    ResourceContextComponent, CodeSystemSearchComponent, ValueSetSearchComponent, StatusTagComponent
  ]
})
export class ServerAuthoritativeEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serverService = inject(ServerService);

  protected server?: Server;
  protected type!: string;
  protected resources: AuthoritativeResourceRow[] = [];
  protected previewResources?: any[];
  protected loader = new LoadingManager();
  protected manualUrl = '';

  private fieldMap: Record<string, string> = {
    'code-systems': 'authoritative',
    'value-sets': 'authoritativeValuesets',
    'concept-maps': 'authoritativeConceptmaps',
    'structure-definitions': 'authoritativeStructuredefinitions',
    'structure-maps': 'authoritativeStructuremaps',
  };

  protected headerLabelMap: Record<string, string> = {
    'code-systems': 'web.server.authoritative-code-systems',
    'value-sets': 'web.server.authoritative-value-sets',
    'concept-maps': 'web.server.authoritative-concept-maps',
    'structure-definitions': 'web.server.authoritative-structure-definitions',
    'structure-maps': 'web.server.authoritative-structure-maps',
  };

  protected descriptionLabelMap: Record<string, string> = {
    'code-systems': 'web.server.authoritative-description-code-systems',
    'value-sets': 'web.server.authoritative-description-value-sets',
    'concept-maps': 'web.server.authoritative-description-concept-maps',
    'structure-definitions': 'web.server.authoritative-description-structure-definitions',
    'structure-maps': 'web.server.authoritative-description-structure-maps',
  };

  protected get resourceAdapter(): any {
    return this.server ? {id: this.server.id, title: this.server.names, name: this.server.code} : undefined;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.type = this.route.snapshot.paramMap.get('type')!;
    this.loader.wrap('load', this.serverService.load(id)).subscribe(server => {
      this.server = server;
      const field = this.fieldMap[this.type];
      this.resources = (server[field] || []).map(ar => ({...ar, _inclusive: true}));
    });
  }

  addFromSearch(item: any): void {
    if (!item) return;
    this.resources = [...this.resources, {url: item.uri, name: item.id, _inclusive: true}];
  }

  addManual(): void {
    if (!this.manualUrl?.trim()) return;
    this.resources = [...this.resources, {url: this.manualUrl.trim(), _inclusive: true}];
    this.manualUrl = '';
  }

  deleteRow(row: AuthoritativeResourceRow): void {
    this.resources = this.resources.filter(r => r !== row);
  }

  save(): void {
    const field = this.fieldMap[this.type];
    const inclusive = this.resources.filter(r => r._inclusive !== false);
    this.server[field] = inclusive.map(({_inclusive, ...ar}) => ar);
    this.loader.wrap('save', this.serverService.save(copyDeep(this.server))).subscribe(() => {
      this.router.navigate(['/servers', this.server.id, 'summary']);
    });
  }

  preview(): void {
    const patterns = this.resources.filter(r => r._inclusive !== false).map(({_inclusive, ...ar}) => ar);
    this.loader.wrap('preview',
      this.serverService.previewAuthoritative(this.server.id, this.type, patterns)
    ).subscribe(result => this.previewResources = result);
  }
}
