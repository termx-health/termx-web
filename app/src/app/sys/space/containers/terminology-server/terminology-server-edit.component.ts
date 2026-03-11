import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {copyDeep, isDefined, isNil, LoadingManager, validateForm} from '@kodality-web/core-util';
import {AuthoritativeResource, TerminologyServer, TerminologyServerHeader} from 'term-web/sys/_lib/space';
import {TerminologyServerService} from 'term-web/sys/space/services/terminology-server.service';
import { MuiFormModule, MuiCardModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, MuiCheckboxModule, MuiEditableTableModule, MuiInputModule, MuiIconModule, MuiButtonModule, MuiIconButtonModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';
import {CodeSystemSearchComponent} from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import {ValueSetSearchComponent} from 'term-web/resources/_lib/value-set/containers/value-set-search.component';

@Component({
    templateUrl: 'terminology-server-edit.component.html',
    imports: [
        MuiFormModule,
        MuiCardModule,
        FormsModule,
        MuiTextareaModule,
        MuiMultiLanguageInputModule,
        MuiSelectModule,
        MuiCheckboxModule,
        MuiEditableTableModule,
        MuiInputModule,
        MuiIconModule,
        MuiButtonModule,
        MuiIconButtonModule,
        TranslatePipe,
        CodeSystemSearchComponent,
        ValueSetSearchComponent,
    ],
})
export class TerminologyServerEditComponent implements OnInit {
  private terminologyServerService = inject(TerminologyServerService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  protected server: TerminologyServer;
  protected serverKinds: string[];

  protected mode: 'add' | 'edit' = 'add';
  protected loader = new LoadingManager();

  protected manualAuthoritativeUrl: string;
  protected manualAuthoritativeVsUrl: string;

  protected readonly usageOptions = ['code-generation', 'validation', 'publication'];
  protected readonly operationOptions = ['$expand', '$validate-code', '$lookup', '$translate', '$subsumes', '$closure'];
  protected readonly fhirVersionOptions = ['R3', 'R4', 'R4B', 'R5', 'R6'];

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.mode = id ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadServer(Number(id));
    } else {
      this.initServer(new TerminologyServer());
    }

    this.loader.wrap('load', this.terminologyServerService.loadKinds()).subscribe(kinds => {
      this.serverKinds = kinds;
    });
  }

  private loadServer(id: number): void {
    this.loader.wrap('load', this.terminologyServerService.load(id)).subscribe(ts => {
      this.initServer(ts);
    });
  }

  private initServer(server: TerminologyServer): void {
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
    this.loader.wrap('save', this.terminologyServerService.save(ts)).subscribe(() => {
      this.location.back();
    });
  }

  protected keyDefined = (h: TerminologyServerHeader): boolean => {
    return !!h.key?.trim().length;
  };

  protected addAuthoritativeFromCodeSystem(cs: any): void {
    if (!cs || !this.server.authoritative) return;
    const ar = new AuthoritativeResource();
    ar.url = cs.uri;
    ar.name = cs.id;
    this.server.authoritative = [...this.server.authoritative, ar];
  }

  protected addManualAuthoritative(): void {
    if (!this.manualAuthoritativeUrl?.trim() || !this.server.authoritative) return;
    const ar = new AuthoritativeResource();
    ar.url = this.manualAuthoritativeUrl.trim();
    this.server.authoritative = [...this.server.authoritative, ar];
    this.manualAuthoritativeUrl = '';
  }

  protected addAuthoritativeFromValueSet(vs: any): void {
    if (!vs || !this.server.authoritativeValuesets) return;
    const ar = new AuthoritativeResource();
    ar.url = vs.uri;
    ar.name = vs.id;
    this.server.authoritativeValuesets = [...this.server.authoritativeValuesets, ar];
  }

  protected addManualAuthoritativeVs(): void {
    if (!this.manualAuthoritativeVsUrl?.trim() || !this.server.authoritativeValuesets) return;
    const ar = new AuthoritativeResource();
    ar.url = this.manualAuthoritativeVsUrl.trim();
    this.server.authoritativeValuesets = [...this.server.authoritativeValuesets, ar];
    this.manualAuthoritativeVsUrl = '';
  }
}
