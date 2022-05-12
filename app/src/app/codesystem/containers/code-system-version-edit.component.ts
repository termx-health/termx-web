import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemService} from '../services/code-system.service';
import {Location} from '@angular/common';


@Component({
  templateUrl: './code-system-version-edit.component.html',
})
export class CodeSystemVersionEditComponent implements OnInit {
  @ViewChild("form") public form?: NgForm;

  public version?: CodeSystemVersion;
  public versionVersion?: string | null;
  public codeSystemId?: string | null;
  public loading?: boolean;
  public mode?: 'add' | 'edit';

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.versionVersion = this.route.snapshot.paramMap.get('versionId');
    this.mode = this.versionVersion ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadVersion();
    } else {
      this.version = new CodeSystemVersion();
      this.version.status = 'draft';
    }
  }

  private loadVersion(): void {
    if (this.codeSystemId && this.versionVersion) {
      this.loading = true;
      this.codeSystemService.loadVersion(this.codeSystemId, this.versionVersion)
        .subscribe(v => this.version = v)
        .add(() => this.loading = false);
    }
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public save(): void {
    if (!this.validate() || !this.codeSystemId || !this.version) {
      return;
    }
    this.loading = true;
    this.codeSystemService
      .saveVersion(this.codeSystemId, this.version)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
