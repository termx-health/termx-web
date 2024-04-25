import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {collect, isDefined, LoadingManager, DestroyService} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {AuthService} from 'term-web/core/auth';
import {Checklist, LorqueLibService} from 'term-web/sys/_lib';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';

@Component({
  selector: 'tw-cs-checklist-validation',
  templateUrl: './code-system-checklist-validation.component.html',
  providers: [DestroyService]
})
export class CodeSystemChecklistValidationComponent {
  @Input() public codeSystemId: string;
  @Input() public codeSystemVersion: string;
  @Input() public showUnaccomplished: boolean;
  @Output() public emptyConfiguration = new EventEmitter<void>();

  protected loader = new LoadingManager();

  protected checklist: Checklist[];

  private static colorMap = {
    'question-circle': 'grey',
    'check-circle': 'green',
    'exclamation-circle': 'orange',
    'close-circle': 'red'
  };

  public constructor(
    private checklistService: ChecklistService,
    private lorqueService: LorqueLibService,
    protected router: Router,
    protected notificationService: MuiNotificationService,
    protected authService: AuthService,
    private destroy$: DestroyService
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['codeSystemId'] || changes['codeSystemVersion']) && this.codeSystemId && this.codeSystemVersion) {
      this.loadChecklist(this.codeSystemId);
    }
  }

  private loadChecklist(csId: string): void {
    this.loader.wrap('load', this.checklistService.search({
      resourceType: 'CodeSystem',
      resourceId: csId,
      resourceVersion: this.codeSystemVersion,
      assertionsDecorated: true, limit: -1
    })).subscribe(r => {
      this.checklist = r.data;
      if (this.checklist.length === 0) {
        this.emptyConfiguration.emit();
      }
    });
  }

  protected collectChecklists = (checklists: Checklist[]): {[target: string]: Checklist[]} => {
    if (!isDefined(checklists)) {
      return undefined;
    }
    return collect(checklists, c => c.rule.target);
  };

  protected getCheckCode = (check: Checklist): 'question-circle' | 'check-circle' | 'exclamation-circle' | 'close-circle' => {
    if (!isDefined(check.assertions) || check.assertions.length === 0) {
      return 'question-circle';
    }
    if (!check.assertions[0].passed && check.rule.severity === 'error') {
      return 'close-circle';
    }
    if (!check.assertions[0].passed) {
      return 'exclamation-circle';
    }
    return 'check-circle';
  };

  protected getCheckColor = (code: 'question-circle' | 'check-circle' | 'exclamation-circle' | 'close-circle'): string => {
    return CodeSystemChecklistValidationComponent.colorMap[code];
  };

  public filterCheckList = (checklist: Checklist, showUnaccomplished: boolean): boolean => {
    if (!showUnaccomplished) {
      return true;
    }
    return !checklist.assertions?.[0]?.passed;
  };

  protected hasErrors = (lists: Checklist[]): boolean => {
    return !!lists.find(checklist => !checklist.assertions?.[0]?.passed);
  };

  protected createAssertion(checklistId: number, passed: boolean): void {
    this.loader.wrap('create-assertion', this.checklistService.createAssertion(checklistId, this.codeSystemVersion, passed))
      .subscribe(() => this.loadChecklist(this.codeSystemId));
  }

  protected runCheck(checklistId: number): void {
    this.loader.wrap('create-assertion', this.checklistService.runChecks({
      checklistId: checklistId,
      resourceVersion: this.codeSystemVersion
    })).subscribe(() => this.loadChecklist(this.codeSystemId));
  }

  protected runChecks(ruleTarget: string): void {
    this.loader.wrap('create-assertion', this.checklistService.runChecks({
      ruleTarget: ruleTarget,
      resourceType: 'CodeSystem',
      resourceId: this.codeSystemId,
      resourceVersion: this.codeSystemVersion
    })).subscribe(() => this.loadChecklist(this.codeSystemId));
  }

  public openResource(type: string, id: string): void {
    if (type === 'Concept') {
      const canEdit = this.authService.hasPrivilege(`${this.codeSystemId}.CodeSystem.edit`);
      this.router.navigate(['/resources', 'code-systems', this.codeSystemId, 'concepts', id, canEdit ? 'edit' : 'view']);
    }
  }

  protected downloadErrorCsv(): void {
    this.loader.wrap('csv', this.checklistService.startAssertionExport('CodeSystem', this.codeSystemId, this.codeSystemVersion)).subscribe(process => {
      this.loader.wrap('csv', this.lorqueService.pollFinishedProcess(process.id, this.destroy$))
        .subscribe(status => {
          if (status === 'failed') {
            this.lorqueService.load(process.id).subscribe(p => this.notificationService.error(p.resultText));
            return;
          }
          this.checklistService.getAssertionExportResult(process.id);
        });
    });
  }
}
