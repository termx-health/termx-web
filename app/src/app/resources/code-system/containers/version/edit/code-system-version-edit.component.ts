import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {compareValues, isDefined, LoadingManager, validateForm, copyDeep, serializeDate} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'app/src/app/resources/_lib';
import {map, Observable} from 'rxjs';
import {CodeSystemService} from '../../../services/code-system.service';


@Component({
  templateUrl: 'code-system-version-edit.component.html',
})
export class CodeSystemVersionEditComponent implements OnInit {
  protected codeSystemId?: string | null;
  protected version?: CodeSystemVersion;
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';

  public readonly versionPattern: string = '[A-Za-z0-9\\-\\.]{1,64}';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');

    if (isDefined(versionCode)) {
      this.mode = 'edit';
      this.loader.wrap('load', this.codeSystemService.loadVersion(this.codeSystemId, versionCode)).subscribe(v => this.version = this.writeVersion(v));
    } else {
      this.codeSystemService.searchVersions(this.codeSystemId).subscribe(r => {
        const lastVersion = this.getLastVersion(r.data);
        const newVersion= new CodeSystemVersion();
        newVersion.supportedLanguages = lastVersion?.supportedLanguages;
        newVersion.preferredLanguage = lastVersion?.preferredLanguage;
        this.version = this.writeVersion(newVersion);
      });
    }
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.codeSystemService.saveCodeSystemVersion(this.codeSystemId!, this.version))
      .subscribe(() => this.router.navigate(['/resources/code-systems', this.codeSystemId, 'versions', this.version.version, 'summary'], {replaceUrl: true}));
  }

  public versions = (id): Observable<string[]> => {
    return this.codeSystemService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };

  private writeVersion(version: CodeSystemVersion): CodeSystemVersion {
    version.status ??= 'draft';
    version.releaseDate ??= new Date();
    version.identifiers ??= [];
    return version;
  }

  private getLastVersion(versions: CodeSystemVersion[]): CodeSystemVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }
}
