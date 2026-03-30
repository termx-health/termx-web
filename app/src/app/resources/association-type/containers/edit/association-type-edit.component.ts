import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {validateForm} from '@termx-health/core-util';
import {AssociationType} from 'term-web/resources/_lib';
import {AssociationTypeService} from 'term-web/resources/association-type/services/association-type.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiTextareaModule, MuiSelectModule, MuiCheckboxModule, MuiButtonModule } from '@termx-health/ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './association-type-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    FormsModule,
    MuiTextareaModule,
    MuiSelectModule,
    MuiCheckboxModule,
    MuiButtonModule,
    TranslatePipe
],
})
export class AssociationTypeEditComponent implements OnInit {
  private associationTypeService = inject(AssociationTypeService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);


  public associationCode?: string | null;
  public association?: AssociationType;

  public mode: 'add' | 'edit' = 'add';
  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

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
