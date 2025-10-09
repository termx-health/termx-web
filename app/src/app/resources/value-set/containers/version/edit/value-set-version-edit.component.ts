import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {compareValues, LoadingManager, validateForm} from '@kodality-web/core-util';
import {FhirValueSetLibService} from 'app/src/app/fhir/_lib';
import {ValueSetVersion, ValueSetVersionRuleSet} from 'app/src/app/resources/_lib';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {map, Observable} from 'rxjs';

@Component({
  templateUrl: 'value-set-version-edit.component.html',
})
export class ValueSetVersionEditComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public version?: ValueSetVersion;

  public mode: 'add' | 'edit' = 'add';
  public loader = new LoadingManager();

  public readonly versionPattern: string = '[A-Za-z0-9\\-\\.]{1,64}';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private valueSetService: ValueSetService,
    private fhirValueSetService: FhirValueSetLibService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.valueSetVersion = this.route.snapshot.paramMap.get('versionCode');
    this.mode = this.valueSetId && this.valueSetVersion ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.valueSetId!, this.valueSetVersion!);
    } else {
      this.valueSetService.searchVersions(this.valueSetId).subscribe(r => {
        const lastVersion = this.getLastVersion(r.data);
        const newVersion= new ValueSetVersion();
        newVersion.supportedLanguages = lastVersion?.supportedLanguages;
        newVersion.preferredLanguage = lastVersion?.preferredLanguage;
        this.version = this.writeVersion(newVersion);
      });
    }
  }

  private loadVersion(id: string, version: string): void {
    this.loader.wrap('init', this.valueSetService.loadVersion(id, version)).subscribe(version => {
      this.version = this.writeVersion(version);
    });
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.version.status = 'draft';
    this.loader.wrap('save', this.valueSetService.saveValueSetVersion(this.valueSetId!, this.version))
      .subscribe(() => this.router.navigate(['/resources/value-sets', this.valueSetId, 'versions', this.version.version, 'summary'], {replaceUrl: true}));
  }

  public get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }

  public versions = (id): Observable<string[]> => {
    return this.valueSetService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };

  private writeVersion(version: ValueSetVersion): ValueSetVersion {
    version.status ??= 'draft';
    version.releaseDate ??= new Date();
    version.ruleSet ??= new ValueSetVersionRuleSet();
    version.ruleSet.inactive ??= false;
    version.identifiers ??= [];
    return version;
  }

  private getLastVersion(versions: ValueSetVersion[]): ValueSetVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }
}
