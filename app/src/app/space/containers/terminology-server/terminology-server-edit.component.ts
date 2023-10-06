import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {copyDeep, LoadingManager, validateForm} from '@kodality-web/core-util';
import {TerminologyServer, TerminologyServerHeader} from 'term-web/space/_lib';
import {TerminologyServerService} from '../../services/terminology-server.service';
import {forkJoin} from 'rxjs';

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
    private router: Router,
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
  }

  private loadServicer(id: number): void {
    this.loader.wrap('load', forkJoin([
      this.terminologyServerService.load(id),
      this.terminologyServerService.loadKinds()
    ])).subscribe(([ts, kinds]) => {
      this.initServer(ts);
      this.serverKinds = kinds;
    });
  }

  private initServer(server: TerminologyServer): void {
    this.server = server;
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
