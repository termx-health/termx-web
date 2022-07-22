import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {DateRange, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {MeasurementUnitService} from '../../services/measurement-unit.service';
import {MeasurementUnit} from 'lib/src/measurementunit';

@Component({
  templateUrl: './measurement-unit-edit.component.html',
})
export class MeasurementUnitEditComponent implements OnInit {
  public measurementUnitId?: number;
  public measurementUnit?: MeasurementUnit;
  public kinds?: string[];
  public newKind = false;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private measurementUnitService: MeasurementUnitService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.measurementUnitId = Number(this.route.snapshot.paramMap.get('id'));
    this.mode = this.measurementUnitId ? 'edit' : 'add';
    this.loading['kinds'] = true;
    this.measurementUnitService.loadKinds().subscribe(kinds => this.kinds = kinds).add(() => this.loading['kinds'] = false);

    if (this.mode === 'add') {
      this.measurementUnit = new MeasurementUnit();
      this.measurementUnit.period = new DateRange();
    }

    if (this.mode === 'edit') {
      this.loading['init'] = true;
      this.measurementUnitService.load(this.measurementUnitId!).subscribe(mu => this.measurementUnit = mu).add(() => this.loading['init'] = false);
    }
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.measurementUnitService.save(this.measurementUnit!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

}
