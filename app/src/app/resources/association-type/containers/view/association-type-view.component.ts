import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {AssociationType} from 'term-web/resources/_lib';
import {AssociationTypeService} from 'term-web/resources/association-type/services/association-type.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiCheckboxModule } from '@termx-health/ui';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './association-type-view.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    MuiCheckboxModule,
    FormsModule,
    TranslatePipe
],
})
export class AssociationTypeViewComponent implements OnInit {
  private associationTypeService = inject(AssociationTypeService);
  private route = inject(ActivatedRoute);

  public associationCode?: string | null;
  public association?: AssociationType;

  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.associationCode = this.route.snapshot.paramMap.get('code');
    this.loadAssociationType(this.associationCode!);
  }

  private loadAssociationType(code: string): void {
    this.loading = true;
    this.associationTypeService.load(code).subscribe(a => this.association = a).add(() => this.loading = false);
  }
}
