import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'terminology-lib/resources';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemService} from '../../services/code-system.service';
import {Location} from '@angular/common';


@Component({
  templateUrl: 'code-system-version-edit.component.html',
})
export class CodeSystemVersionEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public codeSystemVersion?: string | null;
  public version?: CodeSystemVersion;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.codeSystemVersion = this.route.snapshot.paramMap.get('version');
    this.mode = this.codeSystemId && this.codeSystemVersion ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.codeSystemId!, this.codeSystemVersion!);
    } else {
      this.version = new CodeSystemVersion();
      this.version.status = 'draft';
    }
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    this.codeSystemService.loadVersion(id, version).subscribe(v => this.version = v).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveVersion(this.codeSystemId!, this.version!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}