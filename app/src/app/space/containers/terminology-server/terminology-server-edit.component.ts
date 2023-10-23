import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {copyDeep, isDefined, isNil, LoadingManager, validateForm} from '@kodality-web/core-util';
import {TerminologyServer, TerminologyServerHeader} from 'term-web/space/_lib';
import {TerminologyServerService} from '../../services/terminology-server.service';

@Component({
  templateUrl: 'terminology-server-edit.component.html',
})
export class TerminologyServerEditComponent implements OnInit {
  protected server: TerminologyServer;
  protected serverKinds: string[];

  protected mode: 'add' | 'edit' = 'add';
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private terminologyServerService: TerminologyServerService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

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
