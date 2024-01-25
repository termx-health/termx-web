import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {collect, isDefined, LoadingManager} from '@kodality-web/core-util';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';
import {Checklist} from 'term-web/sys/_lib';
import {Router} from '@angular/router';
import {AuthService} from 'term-web/core/auth';

@Component({
  selector: 'tw-cs-checklist-validation',
  templateUrl: './code-system-checklist-validation.component.html'
})
export class CodeSystemChecklistValidationComponent {
  @Input() public codeSystemId: string;
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
    protected router: Router,
    protected authService: AuthService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadChecklist(this.codeSystemId);
    }
  }

  private loadChecklist(csId: string): void {
    this.loader.wrap('load', this.checklistService.search({
      resourceType: 'CodeSystem',
      resourceId: csId,
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

  protected createAssertion(checklistId: number, passed: boolean): void {
    this.loader.wrap('create-assertion', this.checklistService.createAssertion(checklistId, passed))
      .subscribe(() => this.loadChecklist(this.codeSystemId));
  }

  protected runCheck(checklistId: number): void {
    this.loader.wrap('create-assertion', this.checklistService.runChecks({checklistId: checklistId}))
      .subscribe(() => this.loadChecklist(this.codeSystemId));
  }

  protected runChecks(ruleTarget: string): void {
    this.loader.wrap('create-assertion', this.checklistService.runChecks({
      ruleTarget: ruleTarget,
      resourceType: 'CodeSystem',
      resourceId: this.codeSystemId
    })).subscribe(() => this.loadChecklist(this.codeSystemId));
  }

  public openResource(type: string, id: string): void {
    if (type === 'Concept') {
      const canEdit = this.authService.hasPrivilege(`${this.codeSystemId}.CodeSystem.edit`);
      this.router.navigate(['/resources', 'code-systems', this.codeSystemId, 'concepts', id, canEdit ? 'edit' : 'view']);
    }
  }
}
