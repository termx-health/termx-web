import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { compareValues, isDefined, LoadingManager, validateForm, ApplyPipe } from '@kodality-web/core-util';
import {CodeSystemVersion} from 'term-web/resources/_lib';
import {map, Observable} from 'rxjs';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {AuthService} from 'term-web/core/auth';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiInputModule, MuiDatePickerModule, MuiMultiLanguageInputModule, MuiButtonModule, MuiIconModule } from '@kodality-web/marina-ui';
import { AsyncPipe } from '@angular/common';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { ResourceIdentifiersComponent } from 'term-web/resources/resource/components/resource-identifiers.component';
import { ResourceMultiLanguageViewComponent } from 'term-web/resources/resource/components/resource-multi-language-view.component';
import { ResourceReadonlyConceptComponent } from 'term-web/resources/resource/components/resource-readonly-concept.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'code-system-version-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    StatusTagComponent,
    FormsModule,
    SemanticVersionSelectComponent,
    MuiInputModule,
    MuiDatePickerModule,
    ValueSetConceptSelectComponent,
    MuiMultiLanguageInputModule,
    CodeSystemVersionSelectComponent,
    ResourceIdentifiersComponent,
    ResourceMultiLanguageViewComponent,
    ResourceReadonlyConceptComponent,
    MuiButtonModule,
    MuiIconModule,
    AsyncPipe,
    TranslatePipe,
    ApplyPipe
],
})
export class CodeSystemVersionEditComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected codeSystemId?: string | null;
  protected version?: CodeSystemVersion;
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';
  protected viewMode = false;
  protected canEdit = false;

  public readonly versionPattern: string = '[A-Za-z0-9\\-\\.]{1,64}';

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.viewMode = this.route.snapshot.routeConfig?.path === ':id/versions/:versionCode/details';
    const versionCode = this.route.snapshot.paramMap.get('versionCode');

    if (isDefined(versionCode)) {
      this.mode = 'edit';
      this.canEdit = this.authService.hasPrivilege(this.codeSystemId + '.CodeSystem.edit');
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
