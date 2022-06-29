import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Designation} from 'terminology-lib/resources';
import {Location} from '@angular/common';
import {CodeSystemDesignationFormComponent} from './code-system-designation-form.component';

@Component({
  templateUrl: './code-system-designation-edit.component.html',
})
export class CodeSystemDesignationEditComponent implements OnInit {
  @ViewChild("designationForm") public designationForm?: CodeSystemDesignationFormComponent;

  public designation?: Designation;
  public codeSystemId?: string | null;
  public conceptVersionId?: number;
  public loading = false;
  public mode?: 'edit' | 'add';

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    const designationId = this.route.snapshot.paramMap.get('designation');
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptVersionId = Number(this.route.snapshot.paramMap.get('conceptVersionId'));
    this.mode = designationId ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadDesignation(Number(designationId));
    } else {
      this.designation = new Designation();
    }
  }

  public loadDesignation(designationId: number): void {
    this.loading = true;
    this.codeSystemService.loadDesignation(this.codeSystemId!, designationId).subscribe(d => this.designation = d).add(() => this.loading = false);
  }

  public save(): void {
    if (!this.designationForm?.validate()) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveDesignation(this.codeSystemId!, this.conceptVersionId!, this.designation!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
