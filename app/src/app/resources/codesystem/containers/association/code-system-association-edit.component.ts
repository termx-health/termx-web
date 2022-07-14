import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemAssociation} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  templateUrl: './code-system-association-edit.component.html',
})
export class CodeSystemAssociationEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptVersionId?: number;
  public association?: CodeSystemAssociation;

  public loading: {[k: string]: boolean} = {};
  public mode?: 'edit' | 'add';

  @ViewChild("form") public form?: NgForm;

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
      this.association.codeSystem = this.codeSystemId!;
    }
  }

  public loadAssociation(associationId: number): void {
    this.loading['init'] = true;
    this.codeSystemService.loadAssociation(this.codeSystemId!, associationId).subscribe(a => this.association = a).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!(isDefined(this.form) && validateForm(this.form))) {
      return;
    }
    this.loading['save'] = true;
    this.codeSystemService.saveAssociation(this.codeSystemId!, this.conceptVersionId!, this.association!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k])
  }
}
