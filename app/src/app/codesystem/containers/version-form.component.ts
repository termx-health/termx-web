import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemService} from '../services/code-system.service';
import {Location} from '@angular/common';

@Component({
  selector: 'twa-version-form',
  templateUrl: './version-form.component.html',
})
export class VersionFormComponent implements OnInit {
  public version?: CodeSystemVersion;
  public versionVersion?: string;
  public loading?: boolean;
  public codeSystemId?: string;
  public mode?: 'add' | 'edit';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id') || undefined;
    this.versionVersion = this.route.snapshot.paramMap.get('versionId') || undefined;
    this.loading = true;
    if (this.codeSystemId && this.versionVersion) {
      this.mode = 'edit';
      this.codeSystemService.loadVersion(this.codeSystemId, this.versionVersion)
        .subscribe(v => this.version = v)
        .add(() => this.loading = false);
    } else {
      this.mode = 'add';
      this.version = new CodeSystemVersion();
      this.loading = false;
    }
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public save(): void {
    if (this.validate() && this.codeSystemId && this.version) {
      this.loading = true;
      if (this.mode === 'add') {
        this.codeSystemService
          .saveVersion(this.codeSystemId, this.version)
          .subscribe(() => this.location.back())
          .add(() => this.loading = false);
      }
      if (this.mode === 'edit' && this.version.id) {
        this.codeSystemService
          .editVersion(this.codeSystemId, this.version.id, this.version)
          .subscribe(() => this.location.back())
          .add(() => this.loading = false);
      }
    }
  }
}
