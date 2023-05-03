import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {compareNumbers, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ValueSetService} from '../../services/value-set.service';
import {ValueSetRuleSetComponent} from './ruleset/value-set-rule-set.component';
import {ValueSetVersionConceptModalComponent} from './concepts/value-set-version-concept-modal.component';
import {CodeSystemVersion, ValueSetVersion} from 'term-web/resources/_lib';
import {ValueSetVersionConceptListComponent} from 'term-web/resources/value-set/containers/version/concepts/value-set-version-concept-list.component';
import {map, Observable} from 'rxjs';

@Component({
  templateUrl: 'value-set-version-edit.component.html',
})
export class ValueSetVersionEditComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public version?: ValueSetVersion;

  public mode: 'add' | 'edit' = 'add';
  public loader = new LoadingManager();


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
    this.loader.wrap('init', this.valueSetService.loadVersion(id, version)).subscribe(version => {
      this.version = version;
    });
  }

  public save(): void {
    if (!validateForm(this.form) || (isDefined(this.conceptListComponent) && !this.conceptListComponent.validate())) {
      return;
    }
    this.version.status = 'draft';
    this.version.ruleSet = this.ruleSetComponent?.getRuleSet();
    this.version.concepts = this.conceptListComponent?.getConcepts();
    this.loader.wrap('save', this.valueSetService.saveVersion(this.valueSetId!, this.version)).subscribe(() => {
      this.location.back();
    });
  }

  public expand(): void {
    this.valueSetService.expand({valueSet: this.valueSetId!, valueSetVersion: this.valueSetVersion!}).subscribe(vsConcepts => {
      this.conceptModal?.toggleModal(vsConcepts);
    });
  }


  public get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
  public versions = (id): Observable<string[]> => {
    return this.valueSetService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };
}
