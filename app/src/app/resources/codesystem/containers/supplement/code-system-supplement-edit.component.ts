import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemSupplement, Designation, EntityProperty, EntityPropertyValue} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';


@Component({
  templateUrl: './code-system-supplement-edit.component.html',
})
export class CodeSystemSupplementEditComponent implements OnInit {
  @ViewChild("form") public form!: {validate: () => false};

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
    this.conceptVersionId = Number(this.route.snapshot.queryParamMap.get('conceptVersionId'));
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
    if (!this.form.validate()) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveSupplement(this.codeSystemId!, this.supplement!, this.conceptVersionId)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }

  private setTarget(): void {
    switch (this.supplement?.targetType) {
      case 'Designation':
        this.supplement.target = new Designation();
        break;
      case 'EntityProperty':
        this.supplement.target = new EntityProperty();
        break;
      case 'EntityPropertyValue':
        this.supplement.target = new EntityPropertyValue();
    }
  }

  public getHeader = (targetType: string, mode: string): string => {
    const headers: {[prop: string]: string} = {
      'EntityProperty': `web.supplement.form.property.${mode}-header`,
      'EntityPropertyValue': `web.supplement.form.property-value.${mode}-header`,
      'Designation': `web.supplement.form.designation.${mode}-header`,
    };
    return headers[targetType];
  };

  public hasInvalidTarget(): boolean {
    return !['EntityProperty', 'Designation', 'EntityPropertyValue'].includes(this.supplement!.targetType!);
  }
}