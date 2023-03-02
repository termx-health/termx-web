import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {TerminologyServer} from 'lib/src/project';
import {TerminologyServerService} from '../../services/terminology-server.service';

@Component({
  templateUrl: './terminology-server-edit.component.html',
})
export class TerminologyServerEditComponent implements OnInit {
  public terminologyServer?: TerminologyServer;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

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
      this.loadTerminologyServer(Number(id));
    } else {
      this.terminologyServer = new TerminologyServer();
    }
  }

  private loadTerminologyServer(id: number): void {
    this.loading = true;
    this.terminologyServerService.load(id)
      .subscribe(ts => this.terminologyServer = ts)
      .add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.terminologyServerService.save(this.terminologyServer!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
