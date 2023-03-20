import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {ValueSet} from '@terminology/core';
import {ValueSetService} from '../../services/value-set.service';


@Component({
  templateUrl: 'value-set-edit.component.html',
})
export class ValueSetEditComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSet?: ValueSet;

  public mode: 'add' | 'edit' = 'add';
  public loading: {[k: string]: boolean} = {};
  public narrativeRaw = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.mode = this.valueSetId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadValueSet(this.valueSetId!);
    } else {
      this.valueSet = new ValueSet();
    }
  }

  private loadValueSet(id: string): void {
    this.loading['init'] = true;
    this.valueSetService.load(id).subscribe(v => this.valueSet = v).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.valueSetService.save(this.valueSet!).subscribe(() => this.location.back()).add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
