import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {DateRange, isDefined, validateForm} from '@kodality-web/core-util';
import {Ucum} from 'term-web/ucum/_lib';
import {UcumService} from '../../services/ucum.service';

@Component({
  templateUrl: './ucum-edit.component.html',
})
export class UcumEditComponent implements OnInit {
  public ucumId?: number;
  public ucum?: Ucum;
  public kinds?: string[];
  public newKind = false;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private ucumService: UcumService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.ucumId = Number(this.route.snapshot.paramMap.get('id'));
    this.mode = this.ucumId ? 'edit' : 'add';
    this.loading['kinds'] = true;
    this.ucumService.loadKinds().subscribe(kinds => this.kinds = kinds).add(() => this.loading['kinds'] = false);

    if (this.mode === 'add') {
      this.ucum = new Ucum();
      this.ucum.period = new DateRange();
    }

    if (this.mode === 'edit') {
      this.loading['init'] = true;
      this.ucumService.load(this.ucumId!).subscribe(mu => this.ucum = mu).add(() => this.loading['init'] = false);
    }
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.ucumService.save(this.ucum!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

}
