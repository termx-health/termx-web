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
  public codeSystemId?: string | null;
  public conceptVersionId?: number;
  public designation?: Designation;

  public loading: {[k: string]: boolean} = {};
  public mode?: 'edit' | 'add';

  @ViewChild("designationForm") public designationForm?: CodeSystemDesignationFormComponent;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptVersionId = Number(this.route.snapshot.paramMap.get('conceptVersionId'));
    const designationId = this.route.snapshot.paramMap.get('designation');
    this.mode = designationId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadDesignation(Number(designationId));
    } else {
      this.designation = new Designation();
    }
  }

  public loadDesignation(designationId: number): void {
    this.loading['init'] = true;
    this.codeSystemService.loadDesignation(this.codeSystemId!, designationId).subscribe(d => {
      this.designation = d;
    }).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!this.designationForm?.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.codeSystemService.saveDesignation(this.codeSystemId!, this.conceptVersionId!, this.designation!).subscribe(() => {
      this.location.back();
    }).add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k])
  }
}
