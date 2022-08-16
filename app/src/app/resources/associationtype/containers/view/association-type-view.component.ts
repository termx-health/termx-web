import {Component, OnInit, ViewChild} from '@angular/core';
import {AssociationType} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {AssociationTypeService} from '../../services/association-type.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './association-type-view.component.html',
})
export class AssociationTypeViewComponent implements OnInit {
  public associationCode?: string | null;
  public association?: AssociationType;

  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private associationTypeService: AssociationTypeService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.associationCode = this.route.snapshot.paramMap.get('code');
    this.loadAssociationType(this.associationCode!);
  }

  private loadAssociationType(code: string): void {
    this.loading = true;
    this.associationTypeService.load(code).subscribe(a => this.association = a).add(() => this.loading = false);
  }
}
