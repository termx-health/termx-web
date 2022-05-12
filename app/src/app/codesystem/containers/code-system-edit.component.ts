import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {CodeSystemService} from '../services/code-system.service';
import {CodeSystemFormComponent} from './code-system-form.component';


@Component({
  templateUrl: 'code-system-edit.component.html'
})
export class CodeSystemEditComponent implements OnInit {
  @ViewChild("codeSystemForm") public codeSystemForm?: CodeSystemFormComponent;

  public codeSystemId?: string | null;
  public loading?: boolean;
  public mode?: 'edit' | 'add';

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = this.codeSystemId ? 'edit' : 'add';
  }

  public save(): void {
    if (this.codeSystemForm?.validate()) {
      this.loading = true;
      this.codeSystemService
        .save(this.codeSystemForm.readForm()!)
        .subscribe(() => this.location.back())
        .add(() => this.loading = false);
    }
  }
}
