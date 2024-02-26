import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, isNil, LoadingManager} from '@kodality-web/core-util';
import {MuiEditableTableComponent} from '@kodality-web/marina-ui';
import {Checklist, ChecklistRule} from 'term-web/sys/_lib';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';

@Component({
  selector: 'tw-cs-checklist-configuration',
  templateUrl: './code-system-checklist-configuration.component.html'
})
export class CodeSystemChecklistConfigurationComponent implements OnChanges {
  @Input() public resourceType: string;
  @Input() public resourceId: string;

  @ViewChild("form") public form?: NgForm;
  @ViewChild(MuiEditableTableComponent) public table?: MuiEditableTableComponent<ChecklistRule>;

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

  protected removeWhitelistItem(r: ChecklistRule, i: number): void {
    r['_whitelist']?.splice(i, 1);
    r['_whitelist'] = [...r['_whitelist']];
  }

  protected addWhitelistItem(r: ChecklistRule): void {
    r['_whitelist'] = [...(r['_whitelist'] || []), {resourceType: 'Concept'}];
  }


  public save(): void {
    let checklist = this.checklist.filter(cl => {
      const checkedRule= this.table.mData.find(r => r['_checked'] && r['_checklistId'] === cl.id);
      cl.whitelist = checkedRule?.['_whitelist'];
      return isDefined(checkedRule);
    });
    checklist = [...checklist, ...this.table.mData.filter(r => r['_checked'] && isNil(r['_checklistId'])).map(r => ({rule: r, whitelist: r['_whitelist']}))];
    this.loader.wrap('load', this.checklistService.save(checklist, this.resourceType, this.resourceId))
      .subscribe(() => this.loadChecklist(this.resourceType, this.resourceId));
  }

  public mergerChecklist = (rules: ChecklistRule[], checklist: Checklist[]): ChecklistRule[] => {
   rules.forEach(r => {
     const cl = checklist.find(c => c.rule.id === r.id);
     r['_checked'] = isDefined(cl);
     r['_whitelist'] = cl?.whitelist;
     r['_checklistId'] = cl?.id;
   });
   return rules.filter(r => r.active || r['_checked']);
  };

}
