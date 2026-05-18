import {HttpClient} from '@angular/common/http';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DestroyService, isDefined, LoadingManager, AutofocusDirective, ApplyPipe, KeysPipe } from '@termx-health/core-util';
import { MuiNotificationService, MuiFormModule, MuiCardModule, MuiCheckboxModule, MuiButtonModule, MuiListModule, MuiTagModule, MuiCoreModule } from '@termx-health/ui';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {environment} from 'environments/environment';
import {CodeSystemConcept, ConceptUtil} from 'term-web/resources/_lib';
import {LorqueLibService, LorqueProcess} from 'term-web/sys/_lib';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { FormsModule } from '@angular/forms';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { CodeSystemService } from 'term-web/resources/code-system/services/code-system.service';
import { CodingRefreshApi, CodingValueRefreshModalComponent } from 'term-web/resources/code-system/components/coding-value-refresh-modal.component';

import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

class CodeSystemUniquenessResult {
  public duplicates: {[key: string]: CodeSystemConcept[]};
}

class CodeSystemUniquenessRequest {
  public designations: boolean;
  public properties: boolean;
  public ignoreEmptyProperties?: boolean;
}

@Component({
    templateUrl: './code-system-validator.component.html',
    providers: [DestroyService],
    imports: [NzRowDirective, NzColDirective, MuiFormModule, CodeSystemSearchComponent, AutofocusDirective, FormsModule, CodeSystemVersionSelectComponent, MuiCardModule, MuiCheckboxModule, MuiButtonModule, MuiListModule, MuiTagModule, MuiCoreModule, RouterLink, TranslatePipe, ApplyPipe, KeysPipe, HasAnyPrivilegePipe, CodingValueRefreshModalComponent]
})
export class CodeSystemValidatorComponent implements OnInit {
  private lorqueService = inject(LorqueLibService);
  private notificationService = inject(MuiNotificationService);
  private translateService = inject(TranslateService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);
  private codeSystemService = inject(CodeSystemService);

  protected codeSystem: string;
  protected version: number;
  protected uniquenessRequest: CodeSystemUniquenessRequest = {designations: true, properties: true};
  protected uniquenessResult: CodeSystemUniquenessResult;
  protected loader = new LoadingManager();

  @ViewChild('refreshModal') public refreshModal?: CodingValueRefreshModalComponent;

  protected refreshApi: CodingRefreshApi = {
    findCandidates: (scope, statuses) => {
      if (scope.kind !== 'cs-version') {
        throw new Error('Unexpected scope');
      }
      return this.codeSystemService.findVersionRefCandidates(scope.codeSystemId, scope.version, statuses);
    },
    refresh: (scope, statuses) => {
      if (scope.kind !== 'cs-version') {
        throw new Error('Unexpected scope');
      }
      return this.codeSystemService.refreshVersionRefs(scope.codeSystemId, scope.version, statuses);
    }
  };

  protected openRefreshReferences(): void {
    if (!this.codeSystem || !this.version) {
      return;
    }
    this.loader.wrap('refresh-load', this.codeSystemService.searchVersions(this.codeSystem, {ids: String(this.version), limit: 1}))
      .subscribe(r => {
        const v = r?.data?.[0];
        if (!v?.version) {
          this.notificationService.error('Version not found');
          return;
        }
        this.refreshModal?.open({kind: 'cs-version', codeSystemId: this.codeSystem, version: v.version});
      });
  }

  public ngOnInit(): void {
    this.codeSystem = this.route.snapshot.paramMap.get('code-system');
    const versionId = this.route.snapshot.paramMap.get('version');
    this.version = versionId ? Number(versionId) : undefined;
  }

  public validateUniqueness(): void {
    this.uniquenessResult = undefined;

    if (!isDefined(this.codeSystem)) {
      return;
    }

    const request = {codeSystem: this.codeSystem, versionId: this.version, ...this.uniquenessRequest};
    this.loader.wrap('validate', this.http.post<LorqueProcess>(`${environment.termxApi}/ts/code-systems/validator/validate-uniqueness`, request)).subscribe(process => {
      this.loader.wrap('validate', this.lorqueService.pollFinishedProcess(process.id, this.destroy$)).subscribe(status =>
        this.lorqueService.load(process.id).subscribe(p => {
          if (status === 'failed') {
            this.notificationService.error(p.resultText);
          } else {
            this.uniquenessResult = JSON.parse(p.resultText);
          }
        }));
    });
  }

  public detectCircularDependencies(): void {
    this.uniquenessResult = undefined;

  }

  public getDisplay = (concept: CodeSystemConcept): string => {
    return ConceptUtil.getDisplay(concept, this.translateService.currentLang);
  };
}
