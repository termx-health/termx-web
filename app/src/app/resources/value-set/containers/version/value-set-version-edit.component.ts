import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {ValueSetService} from '../../services/value-set.service';
import {ValueSetRuleSetComponent} from './ruleset/value-set-rule-set.component';
import {ValueSetVersionConceptModalComponent} from './concepts/value-set-version-concept-modal.component';
import {CodeSystemVersion, ValueSetVersion} from 'term-web/resources/_lib';
import {ValueSetVersionConceptListComponent} from 'term-web/resources/value-set/containers/version/concepts/value-set-version-concept-list.component';

@Component({
  templateUrl: 'value-set-version-edit.component.html',
})
export class ValueSetVersionEditComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public version?: ValueSetVersion;

  public mode: 'add' | 'edit' = 'add';
  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;
  @ViewChild("ruleSetComponent") public ruleSetComponent?: ValueSetRuleSetComponent;
  @ViewChild("conceptListComponent") public conceptListComponent?: ValueSetVersionConceptListComponent;
  @ViewChild("conceptModal") public conceptModal?: ValueSetVersionConceptModalComponent;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.valueSetVersion = this.route.snapshot.paramMap.get('versionCode');
    this.mode = this.valueSetId && this.valueSetVersion ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.valueSetId!, this.valueSetVersion!);
    } else {
      this.version = new CodeSystemVersion();
    }
  }

  private loadVersion(id: string, version: string): void {
    this.loading['init'] = true;
    this.valueSetService.loadVersion(id, version).subscribe(version => this.version = version).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form) || !this.conceptListComponent.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.version!.status = 'draft';
    this.version!.ruleSet = this.ruleSetComponent?.getRuleSet();
    this.version!.concepts = this.conceptListComponent?.getConcepts();
    this.valueSetService.saveVersion(this.valueSetId!, this.version!).subscribe(() => this.location.back()).add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }

  public expand(): void {
    this.valueSetService.expand({valueSet: this.valueSetId!, valueSetVersion: this.valueSetVersion!}).subscribe(vsConcepts => {
      this.conceptModal?.toggleModal(vsConcepts);
    });
  }
}
