import {Component, OnInit, ViewChild} from '@angular/core';
import {ValueSet, ValueSetVersion, ValueSetVersionConcept, ValueSetVersionRule} from 'app/src/app/resources/_lib';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {forkJoin} from 'rxjs';
import {ValueSetRuleFormComponent} from 'app/src/app/resources/value-set/containers/version/rule/value-set-rule-form.component';
import {JobLibService} from 'app/src/app/sys/_lib';

@Component({
  templateUrl: 'value-set-version-summary.component.html',
  providers: [DestroyService]
})
export class ValueSetVersionSummaryComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected valueSetVersion?: ValueSetVersion;
  protected rule?: {index: number, rule: ValueSetVersionRule};
  protected loader = new LoadingManager();

  @ViewChild(ValueSetRuleFormComponent) public ruleFormComponent?: ValueSetRuleFormComponent;

  public constructor(
    private route: ActivatedRoute,
    private valueSetService: ValueSetService,
    private jobService: JobLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  protected getFirstRows = (concepts: ValueSetVersionConcept[]): ValueSetVersionConcept[] => {
    return concepts?.length > 20 ? concepts.slice(0, 20) : concepts;
  };

  protected saveRule(): void {
    if (!this.ruleFormComponent || !this.ruleFormComponent.validate()) {
      return;
    }
    this.loader.wrap('save-rule', this.valueSetService.saveRule(this.valueSet.id, this.valueSetVersion.ruleSet.id, this.rule.rule)).subscribe(() => {
      this.rule = undefined;
      this.loadData(this.valueSet.id, this.valueSetVersion.version);
    });
  }

  protected deleteRule(): void {
    if (!this.rule) {
      return;
    }
    if (this.rule.index && !this.rule.rule?.id) {
      this.valueSetVersion.ruleSet.rules.splice(this.rule.index, 1);
      this.rule = undefined;
      return;
    }
    this.loader.wrap('delete-rule', this.valueSetService.deleteRule(this.valueSet.id, this.rule.rule.id)).subscribe(() => {
      this.rule = undefined;
      this.loadData(this.valueSet.id, this.valueSetVersion.version);
    });
  }

  protected reloadExpansion(): void {
    this.loader.wrap('expand', this.valueSetService.expandAsync({valueSet: this.valueSet.id, valueSetVersion: this.valueSetVersion.version})).subscribe(job => {
      this.pollJobStatus(job.jobId);
    });
  }

  private pollJobStatus(jobId: number): void {
    this.loader.wrap('expand', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(jobResp => {
      this.loadData(this.valueSet.id, this.valueSetVersion.version);
    });
  }

  private loadData(valueSet: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([this.valueSetService.load(valueSet), this.valueSetService.loadVersion(valueSet, versionCode)])
    ).subscribe(([vs, vsv]) => {
      this.valueSet = vs;
      this.valueSetVersion = vsv;
    });
  }

  protected addRule(): void {
    const rule = {type: 'include'};
    this.valueSetVersion.ruleSet ??= {};
    this.valueSetVersion.ruleSet.rules = [...(this.valueSetVersion.ruleSet.rules || []), rule];
    this.rule = {index: this.valueSetVersion.ruleSet.rules.indexOf(rule), rule: rule};
  }
}
