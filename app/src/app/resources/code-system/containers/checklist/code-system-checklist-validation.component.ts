import {Component, Input, SimpleChanges} from '@angular/core';
import {collect, isDefined, LoadingManager} from '@kodality-web/core-util';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';
import {Checklist} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-cs-checklist-validation',
  templateUrl: './code-system-checklist-validation.component.html'
})
export class CodeSystemChecklistValidationComponent {
  @Input() public resourceType: string;
  @Input() public resourceId: string;
  @Input() public showUnaccomplished: boolean;

  protected loader = new LoadingManager();

  protected checklist: Checklist[];

  private static colorMap = {
    'question-circle': 'grey',
    'check-circle': 'green',
    'exclamation-circle': 'orange',
    'close-circle': 'red'
  };

  public constructor(private checklistService: ChecklistService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['resourceType'] || changes['resourceId']) && this.resourceType && this.resourceId) {
      this.loadChecklist(this.resourceType, this.resourceId);
    }
  }

  private loadChecklist(resourceType: string, resourceId: string): void {
    this.loader.wrap('load', this.checklistService.search({
      resourceType: resourceType,
      resourceId: resourceId,
      assertionsDecorated: true, limit: -1
    })).subscribe(r => this.checklist = r.data);
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

  protected createAssertion(checklistId: number, passed: boolean): void {
    this.loader.wrap('create-assertion', this.checklistService.createAssertion(checklistId, passed))
      .subscribe(() => this.loadChecklist(this.resourceType, this.resourceId));
  }

  protected runCheck(checklistId: number): void {
    this.loader.wrap('create-assertion', this.checklistService.runChecks({checklistId: checklistId}))
      .subscribe(() => this.loadChecklist(this.resourceType, this.resourceId));
  }

  protected runChecks(ruleTarget: string): void {
    this.loader.wrap('create-assertion', this.checklistService.runChecks({
      ruleTarget: ruleTarget,
      resourceType: this.resourceType,
      resourceId: this.resourceId
    })).subscribe(() => this.loadChecklist(this.resourceType, this.resourceId));
  }
}
