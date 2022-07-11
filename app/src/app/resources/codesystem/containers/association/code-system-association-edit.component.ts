import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemAssociation} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {CodeSystemAssociationFormComponent} from './code-system-association-form.component';

@Component({
  templateUrl: './code-system-association-edit.component.html',
})
export class CodeSystemAssociationEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptVersionId?: number;
  public association?: CodeSystemAssociation;

  public loading = false;
  public mode?: 'edit' | 'add';

  @ViewChild("associationForm") public associationForm?: CodeSystemAssociationFormComponent;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptVersionId = Number(this.route.snapshot.paramMap.get('conceptVersionId'));
    const associationId = this.route.snapshot.paramMap.get('association');
    this.mode = associationId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadAssociation(Number(associationId));
    } else {
      this.association = new CodeSystemAssociation();
    }
  }

  public loadAssociation(associationId: number): void {
    this.loading = true;
    this.codeSystemService.loadAssociation(this.codeSystemId!, associationId).subscribe(a => this.association = a).add(() => this.loading = false);
  }

  public save(): void {
    if (!this.associationForm?.validate()) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveAssociation(this.codeSystemId!, this.conceptVersionId!, this.association!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
