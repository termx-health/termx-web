import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {copyDeep, isDefined, isNil, LoadingManager, validateForm} from '@kodality-web/core-util';
import {TerminologyServer, TerminologyServerHeader} from 'term-web/sys/_lib/space';
import {TerminologyServerService} from 'term-web/sys/space/services/terminology-server.service';
import { MuiFormModule, MuiCardModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, MuiCheckboxModule, MuiEditableTableModule, MuiInputModule, MuiIconModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';

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
        TranslatePipe,
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

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.mode = id ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadServicer(Number(id));
    } else {
      this.initServer(new TerminologyServer());
    }

    this.loader.wrap('load', this.terminologyServerService.loadKinds()).subscribe(kinds => {
      this.serverKinds = kinds;
    });
  }

  private loadServicer(id: number): void {
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
}
