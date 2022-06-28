import {Component, OnInit, ViewChild} from '@angular/core';
import {EntityProperty} from 'terminology-lib/resources';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {CodeSystemService} from '../../services/code-system.service';
import {CodeSystemPropertyFormComponent} from './code-system-property-form.component';

@Component({
  templateUrl: './code-system-property-edit.component.html',
})
export class CodeSystemPropertyEditComponent implements OnInit {
  @ViewChild("propertyForm") public propertyForm!: CodeSystemPropertyFormComponent;

  public property?: EntityProperty;
  public codeSystemId?: string | null;
  public loading = false;
  public mode?: 'edit' | 'add';

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('propertyId');
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = propertyId ? 'edit' : 'add';
    if (this.mode === 'add') {
      this.property = new EntityProperty();
    } else {
      this.loadProperty(Number(propertyId));
    }
  }

  private loadProperty(propertyId: number): void {
    this.loading = true;
    this.codeSystemService.loadEntityProperty(this.codeSystemId!, propertyId).subscribe(ep => this.property = ep).add(() => this.loading = false);
  }

  public save(): void {
    if (!this.propertyForm.validate()) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveEntityProperty(this.codeSystemId!, this.property!).subscribe(() => this.location.back()).add(() => this.loading = false);
  }
}
