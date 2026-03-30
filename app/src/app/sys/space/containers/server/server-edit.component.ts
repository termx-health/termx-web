import {Location} from '@angular/common';
import {Component, OnInit, ViewChild, inject} from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, isNil, LoadingManager, validateForm} from '@termx-health/core-util';
import {Server, ServerHeader} from 'term-web/sys/_lib/space';
import {ServerService} from 'term-web/sys/space/services/server.service';
import {MuiFormModule, MuiCardModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, MuiCheckboxModule, MuiEditableTableModule, MuiInputModule, MuiIconModule, MuiButtonModule, MuiIconButtonModule, MuiDividerModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';

@Component({
  templateUrl: 'server-edit.component.html',
  imports: [
    MuiFormModule, MuiCardModule, FormsModule, MuiTextareaModule, MuiMultiLanguageInputModule,
    MuiSelectModule, MuiCheckboxModule, MuiEditableTableModule, MuiInputModule, MuiIconModule, MuiDividerModule,
    MuiButtonModule, MuiIconButtonModule, TranslatePipe, ResourceContextComponent, MarinaUtilModule, RouterLink,
  ],
})
export class ServerEditComponent implements OnInit {
  private serverService = inject(ServerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  protected server: Server;
  protected serverKinds: string[];

  protected mode: 'add' | 'edit' | 'view' = 'add';
  protected viewMode = false;
  protected loader = new LoadingManager();

  protected readonly usageOptions = ['code-generation', 'validation', 'publication'];
  protected readonly operationOptions = ['$expand', '$validate-code', '$lookup', '$translate', '$subsumes', '$closure'];
  protected readonly fhirVersionOptions = ['R3', 'R4', 'R4B', 'R5', 'R6'];
  protected readonly strategyOptions = ['inline', 'cached', 'local'];

  @ViewChild("form") public form?: NgForm;

  protected get resourceAdapter(): any {
    return this.server ? {id: this.server.id, title: this.server.names, name: this.server.code} : undefined;
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const path = this.route.snapshot.routeConfig?.path;
    this.viewMode = path === ':id/details';
    this.mode = id ? (this.viewMode ? 'view' : 'edit') : 'add';

    if (id) {
      this.loadServer(Number(id));
    } else {
      this.initServer(new Server());
    }

    this.loader.wrap('kinds', this.serverService.loadKinds()).subscribe(kinds => {
      this.serverKinds = kinds;
    });
  }

  private loadServer(id: number): void {
    this.loader.wrap('load', this.serverService.load(id)).subscribe(ts => {
      this.initServer(ts);
    });
  }

  private initServer(server: Server): void {
    server.fhirVersions = server.fhirVersions?.length ? server.fhirVersions : [{}];
    this.server = server;
    if (server.id) {
      if (server.authConfig) {
        server.authConfig['_masked'] = isDefined(server.authConfig.clientId) && isNil(server.authConfig.clientSecret);
      }
      if (server.headers) {
        server.headers.filter(h => "Authorization" === h.key && isNil(h.value)).forEach(h => h['_masked'] = true);
      }
    }
  }

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const ts = copyDeep(this.server);
    ts.fhirVersions = ts.fhirVersions?.filter(fv => fv.url || fv.version);
    this.loader.wrap('save', this.serverService.save(ts)).subscribe(saved => {
      if (this.mode === 'add') {
        this.router.navigate(['/servers', saved.id, 'summary']);
      } else {
        this.router.navigate(['/servers', saved.id, 'summary']);
      }
    });
  }

  protected keyDefined = (h: ServerHeader): boolean => {
    return !!h.key?.trim().length;
  };
}
