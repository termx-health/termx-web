import {Component, OnInit, ViewChild} from '@angular/core';
import {AssociationType} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {AssociationTypeService} from '../../services/association-type.service';

@Component({
  templateUrl: './association-type-edit.component.html',
})
export class AssociationTypeEditComponent implements OnInit {

  public associationCode?: string | null;
  public association?: AssociationType;

  public mode: 'add' | 'edit' = 'add';
  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private associationTypeService: AssociationTypeService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.associationCode = this.route.snapshot.paramMap.get('code');
    this.mode = this.associationCode ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadAssociationType(this.associationCode!);
    } else {
      this.association = new AssociationType();
    }
  }

  private loadAssociationType(code: string): void {
    this.loading['init'] = true;
    this.associationTypeService.load(code).subscribe(a => this.association = a).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.associationTypeService.save(this.association!).subscribe(() => this.location.back()).add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
