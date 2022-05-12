import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {ValueSet} from 'terminology-lib/valueset/services/value-set';
import {ValueSetService} from '../services/value-set.service';


@Component({
  templateUrl: './value-set-edit.component.html',
})
export class ValueSetEditComponent implements OnInit {
  @ViewChild("form") public form?: NgForm;

  public valueSetId?: string | null;
  public valueSet?: ValueSet;
  public loading?: boolean;
  public mode?: 'add' | 'edit';

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.mode = this.valueSetId ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadValueSet();
    } else {
      this.valueSet = new ValueSet();
    }
  }

  private loadValueSet(): void {
    if (!this.valueSetId) {
      return;
    }
    this.loading = true;
    this.valueSetService.load(this.valueSetId)
      .subscribe(v => this.valueSet = v)
      .add(() => this.loading = false);
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public save(): void {
    if (!this.validate() || !this.valueSet) {
      return;
    }
    this.loading = true;
    this.valueSetService
      .save(this.valueSet)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
