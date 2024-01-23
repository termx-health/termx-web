import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {Checklist, ChecklistRule} from 'term-web/sys/_lib';
import {NgForm} from '@angular/forms';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';

@Component({
  selector: 'tw-cs-checklist-configuration',
  templateUrl: './code-system-checklist-configuration.component.html'
})
export class CodeSystemChecklistConfigurationComponent implements OnChanges {
  @Input() public resourceType: string;
  @Input() public resourceId: string;

  @ViewChild("form") public form?: NgForm;

  protected loader = new LoadingManager();

  protected checklist: Checklist[];
  protected rules: ChecklistRule[];

  public constructor(private checklistService: ChecklistService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['resourceType'] || changes['resourceId']) && this.resourceType && this.resourceId) {
      this.loadChecklist(this.resourceType, this.resourceId);
      this.loadRules(this.resourceType);
    }

  }

  private loadChecklist(resourceType: string, resourceId: string): void {
    this.checklistService.search({resourceType: resourceType, resourceId: resourceId, limit: -1})
      .subscribe(r => this.checklist = r.data);
  }

  private loadRules(resourceType: string): void {
    this.checklistService.searchRules({resourceType: resourceType, limit: -1})
      .subscribe(r => this.rules = r.data);

  }

  protected filterRules = (rule: ChecklistRule, checklist: Checklist[], currentRule: ChecklistRule): boolean => {
    return rule?.id === currentRule?.id || !checklist.find(c => c.rule?.id === rule?.id);
  };

  protected removeWhitelistItem(c: Checklist, i: number): void {
    c.whitelist?.splice(i, 1);
    c.whitelist = [...c.whitelist];
  }

  protected addWhitelistItem(c: Checklist): void {
    c.whitelist = [...(c.whitelist || []), {resourceType: 'Concept'}];
  }


  public save(): void {
    this.checklistService.save(this.checklist, this.resourceType, this.resourceId)
      .subscribe(() => this.loadChecklist(this.resourceType, this.resourceId));
  }
}
