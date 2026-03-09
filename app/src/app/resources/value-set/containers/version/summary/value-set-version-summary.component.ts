import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DestroyService, LoadingManager, ApplyPipe, LocalDatePipe } from '@kodality-web/core-util';
import { MuiNotificationService, MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule, MuiDividerModule, MuiNoDataModule, MuiCoreModule, MuiPopconfirmModule } from '@kodality-web/marina-ui';
import {ValueSet, ValueSetVersion, ValueSetVersionConcept, ValueSetVersionRule, ValueSetVersionRuleSet} from 'term-web/resources/_lib';
import {ValueSetRuleFormComponent} from 'term-web/resources/value-set/containers/version/rule/value-set-rule-form.component';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {JobLibService} from 'term-web/sys/_lib';
import {AuthService} from 'term-web/core/auth';
import {forkJoin, map} from 'rxjs';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';
import { AsyncPipe } from '@angular/common';
import { ValueSetVersionInfoWidgetComponent } from 'term-web/resources/value-set/containers/version/widgets/value-set-version-info-widget.component';
import { ValueSetVersionRuleSetWidgetComponent } from 'term-web/resources/value-set/containers/version/widgets/value-set-version-rule-set-widget.component';
import { ValueSetRuleFormComponent as ValueSetRuleFormComponent_1 } from 'term-web/resources/value-set/containers/version/rule/value-set-rule-form.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: 'value-set-version-summary.component.html',
    providers: [DestroyService],
    imports: [ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, MuiButtonModule, RouterLink, MuiIconModule, ValueSetVersionInfoWidgetComponent, ValueSetVersionRuleSetWidgetComponent, MuiDividerModule, MuiNoDataModule, MuiCoreModule, MuiPopconfirmModule, ValueSetRuleFormComponent_1, AsyncPipe, TranslatePipe, ApplyPipe, LocalDatePipe, HasAnyPrivilegePipe, PrivilegedPipe]
})
export class ValueSetVersionSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private valueSetService = inject(ValueSetService);
  private notificationService = inject(MuiNotificationService);
  private jobService = inject(JobLibService);
  private destroy$ = inject(DestroyService);
  private authService = inject(AuthService);

  protected valueSet?: ValueSet;
  protected valueSetVersion?: ValueSetVersion;
  protected rule?: {index: number, rule: ValueSetVersionRule};
  protected ruleSetChanged?: boolean;
  protected loader = new LoadingManager();

  protected isAuthenticated = this.authService.isAuthenticated.pipe(
    map(isAuth => isAuth)
  );

  @ViewChild(ValueSetRuleFormComponent) public ruleFormComponent?: ValueSetRuleFormComponent;

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
    this.loader.wrap('save-rule', this.valueSetService.saveRule(this.valueSet.id, this.valueSetVersion.version, this.rule.rule)).subscribe(() => {
      this.rule = undefined;
      this.loadData(this.valueSet.id, this.valueSetVersion.version);
    });
  }

  protected saveRuleSet(): void {
    this.loader.wrap('save-rule-set', this.valueSetService.saveRuleSet(this.valueSet.id, this.valueSetVersion.version, this.valueSetVersion.ruleSet)).subscribe(() => {
      this.ruleSetChanged = false;
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
    if (this.rule.rule?.id) {
      this.loader.wrap('delete-rule', this.valueSetService.deleteRule(this.valueSet.id, this.valueSetVersion.version, this.rule.rule.id)).subscribe(() => {
        this.rule = undefined;
        this.loadData(this.valueSet.id, this.valueSetVersion.version);
      });
    }
  }

  protected reloadExpansion(): void {
    if (this.valueSetVersion.status != 'draft') {
      this.notificationService.warning('web.value-set-version.summary.expansion-warning');
      return;
    }
    this.loader.wrap('expand', this.valueSetService.expandAsync({valueSet: this.valueSet.id, valueSetVersion: this.valueSetVersion.version})).subscribe(job => {
      this.pollJobStatus(job.jobId);
    });
  }

  private pollJobStatus(jobId: number): void {
    this.loader.wrap('expand', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(() => {
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
    this.valueSetVersion.ruleSet ??= new ValueSetVersionRuleSet();
    this.valueSetVersion.ruleSet.rules = [...(this.valueSetVersion.ruleSet.rules || []), rule];
    this.valueSetVersion.ruleSet.inactive ??= false;
    this.rule = {index: this.valueSetVersion.ruleSet.rules.indexOf(rule), rule: rule};
  }
}
