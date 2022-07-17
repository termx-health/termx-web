import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ValueSetVersionRule} from 'terminology-lib/resources';
import {ValueSetService} from '../../../../services/value-set.service';
import {ValueSetRuleFormComponent} from './value-set-rule-form.component';

@Component({
  templateUrl: 'value-set-rule-edit.component.html',
})
export class ValueSetRuleEditComponent implements OnInit {
  public valueSetId?: string | null;
  public ruleSetId?: number | null;
  public rule?: ValueSetVersionRule;

  public mode: 'add' | 'edit' = 'add';
  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: ValueSetRuleFormComponent;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.ruleSetId = Number(this.route.snapshot.paramMap.get('ruleSetId'));
    const ruleId = this.route.snapshot.paramMap.get('ruleId');
    this.mode = this.valueSetId && this.ruleSetId && ruleId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadRule(this.valueSetId!, Number(ruleId));
    } else {
      this.rule = new ValueSetVersionRule();
      this.rule.type = 'include';
    }
  }

  private loadRule(valueSetId: string, ruleId: number): void {
    this.loading['init'] = true;
    this.valueSetService.loadRule(valueSetId, ruleId).subscribe(rule => this.rule = rule).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!this.form?.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.valueSetService.saveRule(this.valueSetId!, this.ruleSetId!, this.rule!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
