import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemSupplement, Designation, EntityProperty} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {CodeSystemPropertyFormComponent} from '../property/code-system-property-form.component';
import {CodeSystemDesignationFormComponent} from '../designation/code-system-designation-form.component';


@Component({
  templateUrl: './code-system-supplement-edit.component.html',
})
export class CodeSystemSupplementEditComponent implements OnInit {
  @ViewChild("propertyForm") public propertyForm!: CodeSystemPropertyFormComponent;
  @ViewChild("designationForm") public designationForm!: CodeSystemDesignationFormComponent;

  public loading = false;
  public supplement?: CodeSystemSupplement;
  public conceptVersionId?: number;
  public codeSystemId?: string | null;
  public mode?: 'edit' | 'add';

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    const supplementId = this.route.snapshot.paramMap.get('supplementId');
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = supplementId ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadSupplement(Number(supplementId));
    } else {
      this.supplement = new CodeSystemSupplement();
      this.supplement!.targetType = this.route.snapshot.queryParamMap.get('targetType') || undefined;
      this.setTarget();
    }
  }

  private loadSupplement(supplementId: number): void {
    this.loading = true;
    this.codeSystemService.loadSupplement(this.codeSystemId!, supplementId).subscribe(s => this.supplement = s).add(() => this.loading = false);
  }

  public save(): void {
    if (this.supplement?.targetType === 'EntityProperty' && !this.propertyForm.validate()) {
      return;
    }
    if (this.supplement?.targetType === 'Designation' && !this.designationForm.validate()) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveSupplement(this.codeSystemId!, this.supplement!, this.conceptVersionId)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }

  private setTarget(): void {
    if (this.supplement?.targetType === 'EntityProperty') {
      this.supplement.target = new EntityProperty();
    }
    if (this.supplement?.targetType === 'Designation') {
      this.conceptVersionId = Number(this.route.snapshot.queryParamMap.get('conceptVersion'));
      this.supplement.target = new Designation();
    }
  }

  public getHeader = (targetType: string, mode: string): string => {
    const a: {[prop: string]: string} = {
      'EntityProperty': `web.supplement.form.property.${mode}-header`,
      'Designation': `web.supplement.form.designation.${mode}-header`,
    };
    return a[targetType];
  };
}