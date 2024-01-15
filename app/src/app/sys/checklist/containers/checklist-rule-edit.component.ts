import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ChecklistRule} from 'term-web/sys/_lib';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';
import {Location} from '@angular/common';


@Component({
  templateUrl: 'checklist-rule-edit.component.html'
})
export class ChecklistRuleEditComponent implements OnInit {
  protected rule?: ChecklistRule;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private checklistService: ChecklistService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

      if (isDefined(id)) {
        this.mode = 'edit';
        this.loader.wrap('load', this.checklistService.loadRule(Number(id))).subscribe(r => this.rule = this.writeRule(r));
      }
      this.rule = this.writeRule(new ChecklistRule());
    });
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loader.wrap('save', this.checklistService.save(this.rule)).subscribe(() => this.location.back());
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  private writeRule(rule: ChecklistRule): ChecklistRule {
    rule.type ??= 'user-defined';
    rule.verification ??= 'human';
    return rule;
  }
}
