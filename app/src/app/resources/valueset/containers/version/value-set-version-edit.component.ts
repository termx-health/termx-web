import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemVersion, ValueSetConcept, ValueSetVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {ValueSetService} from '../../services/value-set.service';
import {ValueSetRuleSetComponent} from './ruleset/value-set-rule-set.component';
import {forkJoin, mergeMap, of} from 'rxjs';

@Component({
  templateUrl: 'value-set-version-edit.component.html',
})
export class ValueSetVersionEditComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public version?: ValueSetVersion;
  public concepts: ValueSetConcept[] = [];

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
    this.valueSetVersion = this.route.snapshot.paramMap.get('versionCode');
    this.mode = this.valueSetId && this.valueSetVersion ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.valueSetId!, this.valueSetVersion!);
    } else {
      this.version = new CodeSystemVersion();
    }
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    forkJoin([
      this.valueSetService.loadVersion(id, version),
      this.valueSetService.loadConcepts(id, version)
    ]).subscribe(([version, concepts]) => {
      this.version = version;
      this.concepts = concepts;
    }).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.version!.status = 'draft';
    this.version!.ruleSet = this.ruleSetComponent?.getRuleSet();
    this.valueSetService.saveVersion(this.valueSetId!, this.version!).pipe(mergeMap(resp => forkJoin([
      of(resp),
      this.valueSetService.saveConcepts(this.valueSetId!, resp.version!, this.concepts),
    ]))).subscribe(() => this.location.back()).add(() => this.loading = false);
  }
}
