import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'app/src/app/resources/_lib';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemService} from '../../../services/code-system.service';
import {Location} from '@angular/common';
import {map, Observable} from 'rxjs';


@Component({
  templateUrl: 'code-system-version-edit.component.html',
})
export class CodeSystemVersionEditComponent implements OnInit {
  protected codeSystemId?: string | null;
  protected version?: CodeSystemVersion;
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.mode = this.codeSystemId && versionCode ? 'edit' : 'add';

    if (isDefined(versionCode)) {
      this.mode = 'edit';
      this.loader.wrap('load', this.codeSystemService.loadVersion(this.codeSystemId, versionCode)).subscribe(v => this.version = this.writeVersion(v));
    } else {
      this.version = this.writeVersion(new CodeSystemVersion());
    }
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.codeSystemService.saveVersion(this.codeSystemId!, this.version!)).subscribe(() => this.location.back());
  }

  public versions = (id): Observable<string[]> => {
    return this.codeSystemService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };

  private writeVersion(version: CodeSystemVersion): CodeSystemVersion {
    version.status ??= 'draft';
    version.releaseDate ??= new Date();
    version.algorithm ??= 'semver';
    return version;
  }
}
