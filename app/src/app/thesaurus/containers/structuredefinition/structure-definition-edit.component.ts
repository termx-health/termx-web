import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {StructureDefinition} from 'terminology-lib/thesaurus';
import {ThesaurusService} from '../../services/thesaurus.service';


@Component({
  templateUrl: 'structure-definition-edit.component.html'
})
export class StructureDefinitionEditComponent implements OnInit {
  public id?: number | null;
  public structureDefinition?: StructureDefinition;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private thesaurusService: ThesaurusService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.mode = this.id ? 'edit' : 'add';

    if (this.mode === 'add') {
      this.structureDefinition = new StructureDefinition();
      this.structureDefinition.contentType = 'profile';
      this.structureDefinition.contentFormat = 'fsh';
    }

    if (this.mode === 'edit') {
      this.loading ['init'] = true;
      this.thesaurusService.loadStructureDefinition(this.id!).subscribe(t => this.structureDefinition = t).add(() => this.loading ['init'] = false);
    }
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.thesaurusService.saveStructureDefinition(this.structureDefinition!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
