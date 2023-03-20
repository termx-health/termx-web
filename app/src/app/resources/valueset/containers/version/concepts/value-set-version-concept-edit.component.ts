import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConcept, Designation, ValueSetVersionConcept} from '@terminology/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {ValueSetService} from '../../../services/value-set.service';

@Component({
  templateUrl: 'value-set-version-concept-edit.component.html',
})
export class ValueSetVersionConceptEditComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public concept?: ValueSetVersionConcept;

  public mode: 'add' | 'edit' = 'add';
  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.valueSetVersion = this.route.snapshot.paramMap.get('versionCode');
    const conceptId = this.route.snapshot.paramMap.get('conceptId');
    this.mode = this.valueSetId && conceptId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadConcept(this.valueSetId!, this.valueSetVersion!, Number(conceptId));
    } else {
      this.concept = new ValueSetVersionConcept();
      this.concept.concept = new CodeSystemConcept();
      this.concept.display = new Designation();
      this.concept.additionalDesignations = [];
    }
  }

  private loadConcept(valueSetId: string, valueSetVersion: string, conceptId: number): void {
    this.loading['init'] = true;
    this.valueSetService.loadConcept(valueSetId, valueSetVersion, conceptId).subscribe(concept => this.concept = concept).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.valueSetService.saveConcept(this.valueSetId!, this.valueSetVersion!, this.concept!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }

  public addDesignation(): void {
    this.concept!.additionalDesignations = [...(this.concept!.additionalDesignations || []), {}];
  }

  public removeDesignation(index: number): void {
    this.concept!.additionalDesignations!.splice(index, 1);
    this.concept!.additionalDesignations = [...this.concept!.additionalDesignations!];
  }
}
