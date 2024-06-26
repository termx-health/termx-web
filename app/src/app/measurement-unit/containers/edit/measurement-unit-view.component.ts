import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {MeasurementUnit} from 'term-web/measurement-unit/_lib';
import {MeasurementUnitService} from '../../services/measurement-unit.service';

@Component({
  templateUrl: './measurement-unit-view.component.html',
})
export class MeasurementUnitViewComponent implements OnInit {
  public measurementUnit?: MeasurementUnit;

  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private measurementUnitService: MeasurementUnitService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    const measurementUnitId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading['init'] = true;
    this.measurementUnitService.load(measurementUnitId).subscribe(mu => this.measurementUnit = mu).add(() => this.loading['init'] = false);
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
