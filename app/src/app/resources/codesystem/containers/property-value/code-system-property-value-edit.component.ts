import {Component, OnInit, ViewChild} from '@angular/core';
import {EntityPropertyValue} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {CodeSystemPropertyValueFormComponent} from './code-system-property-value-form.component';

@Component({
  templateUrl: './code-system-property-value-edit.component.html'
})
export class CodeSystemPropertyValueEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptVersionId?: number;
  public propertyValue?: EntityPropertyValue;

  public loading = false;
  public mode?: 'edit' | 'add';

  @ViewChild("propertyValueForm") public propertyValueForm!: CodeSystemPropertyValueFormComponent;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptVersionId = Number(this.route.snapshot.paramMap.get('conceptVersionId'));
    const propertyValueId = this.route.snapshot.paramMap.get('propertyValueId');
    this.mode = propertyValueId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadPropertyValue(Number(propertyValueId));
    } else {
      this.propertyValue = new EntityPropertyValue();
    }
  }

  public loadPropertyValue(propertyValueId: number): void {
    this.loading = true;
    this.codeSystemService.loadEntityPropertyValue(this.codeSystemId!, propertyValueId).subscribe(pv => this.propertyValue = pv).add(() => this.loading = false);
  }

  public save(): void {
    if (!this.propertyValueForm?.validate()) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveEntityPropertyValue(this.codeSystemId!, this.conceptVersionId!, this.propertyValue!).subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
