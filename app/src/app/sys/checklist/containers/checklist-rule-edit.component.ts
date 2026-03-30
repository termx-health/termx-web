import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {isDefined, LoadingManager, validateForm} from '@termx-health/core-util';
import {ChecklistRule} from 'term-web/sys/_lib';
import {ChecklistService} from 'term-web/sys/checklist/services/checklist.service';
import { MuiSpinnerModule, MuiCardModule, MuiDropdownModule, MuiCoreModule, MuiPopconfirmModule, MuiFormModule, MuiTextareaModule, MuiSelectModule, MuiMultiLanguageInputModule, MuiCheckboxModule, MuiButtonModule } from '@termx-health/ui';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';


@Component({
    templateUrl: 'checklist-rule-edit.component.html',
    imports: [MuiSpinnerModule, FormsModule, MuiCardModule, MuiDropdownModule, MuiCoreModule, MuiPopconfirmModule, MuiFormModule, MuiTextareaModule, MuiSelectModule, MuiMultiLanguageInputModule, ValueSetConceptSelectComponent, MuiCheckboxModule, MuiButtonModule, TranslatePipe, PrivilegedPipe]
})
export class ChecklistRuleEditComponent implements OnInit {
  private checklistService = inject(ChecklistService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  protected rule?: ChecklistRule;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

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
    this.loader.wrap('save', this.checklistService.saveRule(this.rule)).subscribe(() => this.location.back());
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  private writeRule(rule: ChecklistRule): ChecklistRule {
    rule.type ??= 'user-defined';
    rule.verification ??= 'human';
    return rule;
  }

  public delete(): void {
    this.checklistService.deleteRule(this.rule.id).subscribe(() => this.location.back());
  }
}
