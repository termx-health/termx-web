import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isDefined, LoadingManager} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {TranslateService} from '@ngx-translate/core';
import {environment} from 'app/src/environments/environment';
import {CodeSystemConcept, ConceptUtil} from 'term-web/resources/_lib';
import {LorqueLibService, LorqueProcess} from 'term-web/sys/_lib';

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
  providers: [DestroyService]
})
export class CodeSystemValidatorComponent implements OnInit {
  protected codeSystem: string;
  protected version: number;
  protected uniquenessRequest: CodeSystemUniquenessRequest = {designations: true, properties: true};
  protected uniquenessResult: CodeSystemUniquenessResult;
  protected loader = new LoadingManager();

  public constructor(
    public lorqueService: LorqueLibService,
    public notificationService: MuiNotificationService,
    public translateService: TranslateService,
    public http: HttpClient,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) { }

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
