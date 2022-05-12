import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {ValueSetVersion} from 'terminology-lib/valueset/services/value-set-version';
import {ValueSetService} from '../services/value-set.service';

@Component({
  selector: 'twa-value-set-version-form',
  templateUrl: './value-set-version-edit.component.html',
})
export class ValueSetVersionEditComponent implements OnInit {
  @ViewChild("form") public form?: NgForm;

  public version?: ValueSetVersion;
  public versionVersion?: string | null;
  public loading?: boolean;
  public valueSetId?: string | null;
  public mode?: 'add' | 'edit';

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.versionVersion = this.route.snapshot.paramMap.get('versionId');
    this.mode = this.versionVersion ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadVersion();
    } else {
      this.version = new CodeSystemVersion();
    }
  }

  private loadVersion(): void {
    if (this.valueSetId && this.versionVersion) {
      this.loading = true;
      this.valueSetService.loadVersion(this.valueSetId, this.versionVersion)
        .subscribe(v => this.version = v)
        .add(() => this.loading = false);
    }
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public save(): void {
    if (!this.validate() || !this.valueSetId || !this.version) {
      return;
    }
    this.loading = true;
    this.version.status = 'draft';
    this.valueSetService.saveVersion(this.valueSetId, this.version)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
