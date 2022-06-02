import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemVersion, ValueSetVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {ValueSetService} from '../../services/value-set.service';
import {ValueSetRuleSetComponent} from './ruleset/value-set-rule-set.component';

@Component({
  templateUrl: 'value-set-version-edit.component.html',
})
export class ValueSetVersionEditComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public version?: ValueSetVersion;

  public mode: 'add' | 'edit' = 'add';
  public loading = false;

  @ViewChild("form") public form?: NgForm;
  @ViewChild("ruleSetComponent") public ruleSetComponent?: ValueSetRuleSetComponent;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.valueSetVersion = this.route.snapshot.paramMap.get('version');
    this.mode = this.valueSetId && this.valueSetVersion ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.valueSetId!, this.valueSetVersion!);
    } else {
      this.version = new CodeSystemVersion();
    }
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    this.valueSetService.loadVersion(id, version).subscribe(v => this.version = v).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.version!.status = 'draft';
    this.version!.ruleSet = this.ruleSetComponent?.getRuleSet();
    this.valueSetService.saveVersion(this.valueSetId!, this.version!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
